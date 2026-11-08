import { error, fail } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { Actions, PageServerLoad } from './$types';
import { requireUser, withTransaction } from '../../../lib/server/auth';
import { getPool } from '../../../lib/server/db';

type DocumentType = RowDataPacket & {
  document_type_id: number;
  document_code: string;
  name: string;
  description: string | null;
  fee: string | null;
};

type DocumentRequest = RowDataPacket & {
  request_id: number;
  request_code: string;
  document_name: string;
  resident_name: string;
  username: string;
  status: string;
  purpose: string;
  submitted_at: string;
};

type CertificateRecord = RowDataPacket & {
  certificate_record_id: number;
  certificate_code: string;
  resident_id: number | null;
  certificate_type: string;
  recipient_name: string;
  recipient_address: string;
  purpose: string;
  date_issued: string;
  valid_until: string | null;
  status: 'Issued' | 'Pending' | 'Cancelled';
  fee: string;
  remarks: string | null;
  archived_at: string | null;
};

const transitions: Record<string, string[]> = {
  submitted: ['queued', 'cancelled'],
  queued: ['in_review', 'cancelled'],
  in_review: ['correction_required', 'approved', 'rejected'],
  correction_required: ['in_review', 'cancelled'],
  approved: ['ready_for_release', 'rejected'],
  rejected: [],
  ready_for_release: ['released'],
  released: [],
  cancelled: []
};

const certificateTypes = [
  'Barangay Clearance',
  'Indigency Certificate',
  'Residency Certificate',
  'Business Permit',
  'Other'
];
const certificateStatuses = ['Issued', 'Pending', 'Cancelled'];

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = await requireUser(locals);
  const isResident = user.roles.includes('resident');
  const isAdmin = user.roles.includes('admin');
  const isStaff = user.roles.includes('staff');
  let documentTypes: DocumentType[] = [];
  let requests: DocumentRequest[] = [];
  let certificates: CertificateRecord[] = [];
  let residents: (RowDataPacket & { resident_id: number; full_name: string })[] = [];
  const certificateSearch = (url.searchParams.get('certificateSearch') ?? '').trim().slice(0, 100);
  const certificateType = url.searchParams.get('certificateType') ?? '';
  const certificateStatus = url.searchParams.get('certificateStatus') ?? '';
  if ((certificateType && !certificateTypes.includes(certificateType)) ||
    (certificateStatus && !certificateStatuses.includes(certificateStatus))) {
    error(400, 'Invalid certificate filter.');
  }

  if (isResident) {
    const [types] = await getPool().query<DocumentType[]>(
      `SELECT document_type_id, document_code, name, description, fee
         FROM document_types WHERE is_available = TRUE ORDER BY name`
    );
    documentTypes = types;
  }
  if (isAdmin) {
    const searchTerm = `%${certificateSearch}%`;
    [certificates] = await getPool().execute<CertificateRecord[]>(
      `SELECT certificate_record_id, certificate_code, resident_id, certificate_type,
              recipient_name, recipient_address, purpose, date_issued, valid_until,
              status, fee, remarks, archived_at
         FROM certificate_records
        WHERE (? = '' OR certificate_code LIKE ? OR recipient_name LIKE ?)
          AND (? = '' OR certificate_type = ?)
          AND (? = '' OR status = ?)
        ORDER BY archived_at IS NOT NULL, date_issued DESC, certificate_record_id DESC`,
      [certificateSearch, searchTerm, searchTerm, certificateType, certificateType,
        certificateStatus, certificateStatus]
    );
    [residents] = await getPool().query<(RowDataPacket & { resident_id: number; full_name: string })[]>(
      `SELECT resident_id, CONCAT_WS(' ', first_name, middle_name, last_name, suffix) AS full_name
         FROM residents WHERE record_status = 'active' ORDER BY last_name, first_name`
    );
    [requests] = await getPool().query<DocumentRequest[]>(
      `SELECT dr.request_id, dr.request_code, dt.name AS document_name,
              CONCAT_WS(' ', r.first_name, r.middle_name, r.last_name, r.suffix) AS resident_name,
              u.username, dr.status, dr.purpose, dr.submitted_at
         FROM document_requests AS dr
         JOIN document_types AS dt ON dt.document_type_id = dr.document_type_id
         JOIN residents AS r ON r.resident_id = dr.resident_id
         LEFT JOIN users AS u ON u.user_id = r.user_id
        ORDER BY dr.submitted_at DESC`
    );
  } else if (isStaff) {
    [requests] = await getPool().execute<DocumentRequest[]>(
      `SELECT dr.request_id, dr.request_code, dt.name AS document_name,
              CONCAT_WS(' ', r.first_name, r.middle_name, r.last_name, r.suffix) AS resident_name,
              u.username, dr.status, dr.purpose, dr.submitted_at
         FROM document_request_assignments AS a
         JOIN document_requests AS dr ON dr.request_id = a.request_id
         JOIN document_types AS dt ON dt.document_type_id = dr.document_type_id
         JOIN residents AS r ON r.resident_id = dr.resident_id
         LEFT JOIN users AS u ON u.user_id = r.user_id
        WHERE a.staff_user_id = ? AND a.unassigned_at IS NULL
        ORDER BY dr.submitted_at DESC`,
      [user.id]
    );
  } else if (isResident) {
    [requests] = await getPool().execute<DocumentRequest[]>(
      `SELECT dr.request_id, dr.request_code, dt.name AS document_name,
              CONCAT_WS(' ', r.first_name, r.middle_name, r.last_name, r.suffix) AS resident_name,
              u.username, dr.status, dr.purpose, dr.submitted_at
         FROM residents AS owner
         JOIN document_requests AS dr ON dr.resident_id = owner.resident_id
         JOIN document_types AS dt ON dt.document_type_id = dr.document_type_id
         JOIN residents AS r ON r.resident_id = dr.resident_id
         LEFT JOIN users AS u ON u.user_id = r.user_id
        WHERE owner.user_id = ?
        ORDER BY dr.submitted_at DESC`,
      [user.id]
    );
  }
  return {
    documentTypes,
    requests,
    isResident,
    canReview: isAdmin || isStaff,
    canManageCertificates: isAdmin,
    certificates,
    residents,
    certificateSearch,
    certificateType,
    certificateStatus
  };
};

export const actions: Actions = {
  saveCertificate: async ({ request, locals }) => {
    const user = await requireUser(locals);
    if (!user.roles.includes('admin')) {
      return fail(403, { error: 'Only administrators can manage issued certificate records.' });
    }
    const data = await request.formData();
    const id = field(data, 'certificate_record_id');
    const type = field(data, 'certificate_type');
    const name = field(data, 'recipient_name');
    const address = field(data, 'recipient_address');
    const purpose = field(data, 'certificate_purpose');
    const issued = field(data, 'date_issued');
    const validUntil = field(data, 'valid_until');
    const status = field(data, 'certificate_status');
    const fee = field(data, 'fee');
    const remarks = field(data, 'remarks');
    const residentId = field(data, 'resident_id');
    if ((id && !/^\d+$/.test(id)) ||
      (residentId && !/^\d+$/.test(residentId)) ||
      !certificateTypes.includes(type) || !name || name.length > 200 ||
      !address || address.length > 255 || !purpose ||
      !isDate(issued) ||
      (validUntil && !isDate(validUntil)) ||
      (validUntil && validUntil < issued) || !certificateStatuses.includes(status) ||
      !/^\d{1,8}(\.\d{1,2})?$/.test(fee) || Number(fee) < 0 ||
      remarks.length > 10000) {
      return fail(422, { error: 'Check the certificate fields, dates, status, and non-negative fee.' });
    }

    try {
      if (residentId) {
        const [residentRows] = await getPool().execute<RowDataPacket[]>(
          'SELECT resident_id FROM residents WHERE resident_id = ?',
          [Number(residentId)]
        );
        if (!residentRows[0]) {
          return fail(422, { error: 'The selected resident was not found.' });
        }
      }

      if (id) {
        const [existing] = await getPool().execute<RowDataPacket[]>(
          'SELECT certificate_record_id FROM certificate_records WHERE certificate_record_id = ? AND archived_at IS NULL',
          [Number(id)]
        );
        if (!existing[0]) {
          return fail(404, { error: 'Active certificate record was not found.' });
        }
        await getPool().execute(
          `UPDATE certificate_records
              SET resident_id = NULLIF(?, 0), certificate_type = ?, recipient_name = ?,
                  recipient_address = ?, purpose = ?, date_issued = ?, valid_until = NULLIF(?, ''),
                  status = ?, fee = ?, remarks = NULLIF(?, '')
            WHERE certificate_record_id = ?`,
          [residentId ? Number(residentId) : 0, type, name, address, purpose, issued, validUntil,
            status, fee, remarks, Number(id)]
        );
      } else {
        const code = `CERT-${crypto.randomUUID().replaceAll('-', '').slice(0, 20).toUpperCase()}`;
        await getPool().execute(
          `INSERT INTO certificate_records
             (certificate_code, resident_id, certificate_type, recipient_name, recipient_address,
              purpose, date_issued, valid_until, status, fee, remarks, created_by_user_id)
           VALUES (?, NULLIF(?, 0), ?, ?, ?, ?, ?, NULLIF(?, ''), ?, ?, NULLIF(?, ''), ?)`,
          [code, residentId ? Number(residentId) : 0, type, name, address, purpose, issued,
            validUntil, status, fee, remarks, user.id]
        );
      }
    } catch (cause) {
      console.error('Certificate record save failed:', cause);
      return fail(503, { error: 'Certificate record could not be saved.' });
    }
    return { success: 'Certificate record saved.' };
  },
  archiveCertificate: async ({ request, locals }) => {
    const user = await requireUser(locals);
    if (!user.roles.includes('admin')) {
      return fail(403, { error: 'Only administrators can archive certificate records.' });
    }
    const data = await request.formData();
    const id = field(data, 'certificate_record_id');
    if (!/^\d+$/.test(id)) {
      return fail(422, { error: 'Invalid certificate record.' });
    }
    const [result] = await getPool().execute(
      `UPDATE certificate_records SET archived_at = UTC_TIMESTAMP(3)
        WHERE certificate_record_id = ? AND archived_at IS NULL`,
      [Number(id)]
    );
    if ((result as { affectedRows: number }).affectedRows !== 1) {
      return fail(404, { error: 'Active certificate record was not found.' });
    }
    return { success: 'Certificate record archived. The record was retained.' };
  },
  restoreCertificate: async ({ request, locals }) => {
    const user = await requireUser(locals);
    if (!user.roles.includes('admin')) {
      return fail(403, { error: 'Only administrators can restore certificate records.' });
    }
    const data = await request.formData();
    const id = field(data, 'certificate_record_id');
    if (!/^\d+$/.test(id)) {
      return fail(422, { error: 'Invalid certificate record.' });
    }
    const [result] = await getPool().execute(
      `UPDATE certificate_records SET archived_at = NULL
        WHERE certificate_record_id = ? AND archived_at IS NOT NULL`,
      [Number(id)]
    );
    if ((result as { affectedRows: number }).affectedRows !== 1) {
      return fail(404, { error: 'Archived certificate record was not found.' });
    }
    return { success: 'Certificate record restored.' };
  },
  create: async ({ request, locals }) => {
    const user = await requireUser(locals);
    if (!user.permissions.includes('requests.self.create') || !user.roles.includes('resident')) {
      return fail(403, { error: 'Your account cannot submit resident document requests.' });
    }
    const data = await request.formData();
    const typeId = field(data, 'document_type_id');
    const purpose = field(data, 'purpose');
    const notes = field(data, 'resident_notes');
    if (!/^\d+$/.test(typeId) || !purpose || purpose.length > 255 || notes.length > 5000) {
      return fail(422, { error: 'Choose a document and enter a purpose no longer than 255 characters.' });
    }

    await withTransaction(async (connection) => {
      const [residentRows] = await connection.execute<(RowDataPacket & { resident_id: number })[]>(
        `SELECT resident_id FROM residents
          WHERE user_id = ? AND record_status = 'active' FOR UPDATE`,
        [user.id]
      );
      if (!residentRows[0]) {
        throw new Error('No active resident profile is linked to your account.');
      }
      const [typeRows] = await connection.execute<(RowDataPacket & { document_type_id: number })[]>(
        `SELECT document_type_id FROM document_types
          WHERE document_type_id = ? AND is_available = TRUE`,
        [Number(typeId)]
      );
      if (!typeRows[0]) {
        throw new Error('That document service is unavailable.');
      }
      const requestCode = `REQ-${crypto.randomUUID().replaceAll('-', '').slice(0, 20).toUpperCase()}`;
      const [result] = await connection.execute(
        `INSERT INTO document_requests (request_code, resident_id, document_type_id, purpose, resident_notes)
         VALUES (?, ?, ?, ?, NULLIF(?, ''))`,
        [requestCode, residentRows[0].resident_id, Number(typeId), purpose, notes]
      );
      const requestId = Number((result as { insertId: number }).insertId);
      await connection.execute(
        `INSERT INTO request_status_history (request_id, from_status, to_status, changed_by_user_id, reason)
         VALUES (?, NULL, 'submitted', ?, 'Resident submitted the request.')`,
        [requestId, user.id]
      );
    });
    return { success: 'Your document request was submitted.' };
  },
  updateStatus: async ({ request, locals }) => {
    const user = await requireUser(locals);
    const data = await request.formData();
    const requestId = field(data, 'request_id');
    const nextStatus = field(data, 'status');
    if (!/^\d+$/.test(requestId)) {
      return fail(422, { error: 'Invalid request.' });
    }
    const isResidentCancel = nextStatus === 'cancelled' && user.permissions.includes('requests.self.cancel');
    const isReviewer = user.roles.includes('admin')
      ? user.permissions.includes('requests.assigned.update')
      : user.roles.includes('staff') && user.permissions.includes('requests.assigned.update');
    if (!isResidentCancel && !isReviewer) {
      return fail(403, { error: 'Your account cannot change this request.' });
    }

    try {
      await withTransaction(async (connection) => {
        const [requestRows] = await connection.execute<
          (RowDataPacket & { status: string; user_id: number | null; request_code: string })[]
        >(
          `SELECT dr.status, r.user_id, dr.request_code
             FROM document_requests AS dr
             JOIN residents AS r ON r.resident_id = dr.resident_id
            WHERE dr.request_id = ? FOR UPDATE`,
          [Number(requestId)]
        );
        const current = requestRows[0];
        if (!current) {
          throw new Error('Request was not found.');
        }
        if (isResidentCancel && Number(current.user_id) !== user.id) {
          throw new Error('You can only cancel your own requests.');
        }
        if (!isResidentCancel && !user.roles.includes('admin')) {
          const [assignments] = await connection.execute<RowDataPacket[]>(
            `SELECT assignment_id FROM document_request_assignments
              WHERE request_id = ? AND staff_user_id = ? AND unassigned_at IS NULL
              LIMIT 1`,
            [Number(requestId), user.id]
          );
          if (!assignments[0]) {
            throw new Error('This request is not assigned to you.');
          }
        }
        if (!transitions[current.status]?.includes(nextStatus)) {
          throw new Error(`The request cannot move from ${current.status} to ${nextStatus}.`);
        }
        await connection.execute(
          `UPDATE document_requests
              SET status = ?,
                  released_at = IF(? = 'released', UTC_TIMESTAMP(3), released_at)
            WHERE request_id = ?`,
          [nextStatus, nextStatus, Number(requestId)]
        );
        await connection.execute(
          `INSERT INTO request_status_history (request_id, from_status, to_status, changed_by_user_id)
           VALUES (?, ?, ?, ?)`,
          [Number(requestId), current.status, nextStatus, user.id]
        );
        if (!isResidentCancel && current.user_id !== null) {
          await connection.execute(
            `INSERT INTO notifications
               (user_id, notification_type, title, body, related_entity_type, related_entity_id)
             VALUES (?, 'document_request', 'Document request updated', ?, 'document_request', ?)`,
            [current.user_id, `Request ${current.request_code} is now ${nextStatus.replaceAll('_', ' ')}.`,
              Number(requestId)]
          );
        }
      });
    } catch (error) {
      if (error instanceof Error && !('code' in error)) {
        return fail(422, { error: error.message });
      }
      console.error('Document request status update failed:', error);
      return fail(503, { error: 'The request could not be updated.' });
    }
    return { success: 'Request status updated.' };
  }
};
