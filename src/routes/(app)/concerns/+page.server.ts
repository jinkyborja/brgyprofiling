import { error, fail } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { Actions, PageServerLoad } from './$types';
import { requirePermission, requireUser, withTransaction } from '../../../lib/server/auth';
import { getPool } from '../../../lib/server/db';

type Concern = RowDataPacket & {
  concern_id: number;
  concern_code: string;
  resident_id: number;
  resident_user_id: number | null;
  resident_name: string;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: string;
  submitted_at: string;
  updated_at: string;
};

const categories = ['General', 'Sanitation', 'Infrastructure', 'Safety', 'Social services', 'Other'];
const priorities = ['low', 'normal', 'high', 'urgent'];
const transitions: Record<string, string[]> = {
  submitted: ['assigned', 'rejected'],
  assigned: ['investigating', 'rejected'],
  investigating: ['awaiting_resident', 'resolved', 'rejected'],
  awaiting_resident: ['investigating', 'resolved', 'closed'],
  resolved: ['closed'],
  closed: [],
  rejected: [],
  cancelled: []
};

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export const load: PageServerLoad = async ({ locals }) => {
  const user = await requireUser(locals);
  const isAdmin = user.roles.includes('admin');
  const isStaff = user.roles.includes('staff');
  const isResident = user.roles.includes('resident');
  if (!isAdmin && !isStaff && !isResident) {
    error(403, 'Your account cannot access concerns.');
  }

  let concerns: Concern[];
  if (isAdmin) {
    [concerns] = await getPool().query<Concern[]>(
      `SELECT c.concern_id, c.concern_code, c.resident_id, r.user_id AS resident_user_id,
              CONCAT_WS(' ', r.first_name, r.middle_name, r.last_name, r.suffix) AS resident_name,
              c.category, c.subject, c.description, c.priority, c.status, c.submitted_at, c.updated_at
         FROM concerns AS c
         JOIN residents AS r ON r.resident_id = c.resident_id
        ORDER BY FIELD(c.status, 'submitted', 'assigned', 'investigating', 'awaiting_resident',
                       'resolved', 'closed', 'rejected', 'cancelled'),
                 FIELD(c.priority, 'urgent', 'high', 'normal', 'low'), c.submitted_at DESC
        LIMIT 500`
    );
  } else if (isStaff && user.permissions.includes('concerns.assigned.read')) {
    [concerns] = await getPool().execute<Concern[]>(
      `SELECT c.concern_id, c.concern_code, c.resident_id, r.user_id AS resident_user_id,
              CONCAT_WS(' ', r.first_name, r.middle_name, r.last_name, r.suffix) AS resident_name,
              c.category, c.subject, c.description, c.priority, c.status, c.submitted_at, c.updated_at
         FROM concern_assignments AS a
         JOIN concerns AS c ON c.concern_id = a.concern_id
         JOIN residents AS r ON r.resident_id = c.resident_id
        WHERE a.staff_user_id = ? AND a.unassigned_at IS NULL
        ORDER BY FIELD(c.status, 'assigned', 'investigating', 'awaiting_resident', 'submitted',
                       'resolved', 'closed', 'rejected', 'cancelled'),
                 FIELD(c.priority, 'urgent', 'high', 'normal', 'low'), c.submitted_at DESC`,
      [user.id]
    );
  } else if (isResident && user.permissions.includes('concerns.self.read')) {
    [concerns] = await getPool().execute<Concern[]>(
      `SELECT c.concern_id, c.concern_code, c.resident_id, r.user_id AS resident_user_id,
              CONCAT_WS(' ', r.first_name, r.middle_name, r.last_name, r.suffix) AS resident_name,
              c.category, c.subject, c.description, c.priority, c.status, c.submitted_at, c.updated_at
         FROM concerns AS c
         JOIN residents AS r ON r.resident_id = c.resident_id
        WHERE r.user_id = ?
        ORDER BY c.submitted_at DESC`,
      [user.id]
    );
  } else {
    error(403, 'Your account cannot access these concerns.');
  }

  let staff: (RowDataPacket & { user_id: number; username: string })[] = [];
  if (isAdmin) {
    [staff] = await getPool().query<(RowDataPacket & { user_id: number; username: string })[]>(
      `SELECT DISTINCT u.user_id, u.username
         FROM users AS u
         JOIN user_roles AS ur ON ur.user_id = u.user_id
         JOIN roles AS r ON r.role_id = ur.role_id
        WHERE u.account_status = 'active' AND r.role_code = 'staff'
        ORDER BY u.username`
    );
  }
  return { concerns, staff, canCreate: isResident && user.permissions.includes('concerns.self.create'),
    canReview: isAdmin || (isStaff && user.permissions.includes('concerns.assigned.update')), canManage: isAdmin };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const user = await requirePermission(locals, 'concerns.self.create');
    if (!user.roles.includes('resident')) {
      return fail(403, { error: 'Only resident accounts can submit a concern.' });
    }
    const data = await request.formData();
    const category = field(data, 'category');
    const subject = field(data, 'subject');
    const description = field(data, 'description');
    const priority = field(data, 'priority');
    if (!categories.includes(category) || !subject || subject.length > 180 ||
      description.length < 10 || description.length > 10000 ||
      !priorities.includes(priority)) {
      return fail(422, { error: 'Choose a category and priority, and provide a subject and description.' });
    }

    try {
      await withTransaction(async (connection) => {
        const [residentRows] = await connection.execute<
          (RowDataPacket & { resident_id: number })[]
        >(
          `SELECT resident_id FROM residents
            WHERE user_id = ? AND record_status = 'active' FOR UPDATE`,
          [user.id]
        );
        if (!residentRows[0]) {
          throw new Error('No active resident profile is linked to your account.');
        }
        const code = `CON-${crypto.randomUUID().replaceAll('-', '').slice(0, 20).toUpperCase()}`;
        const [result] = await connection.execute(
          `INSERT INTO concerns (concern_code, resident_id, category, subject, description, priority)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [code, residentRows[0].resident_id, category, subject, description, priority]
        );
        await connection.execute(
          `INSERT INTO concern_status_history (concern_id, from_status, to_status, changed_by_user_id, reason)
           VALUES (?, NULL, 'submitted', ?, 'Resident submitted the concern.')`,
          [(result as { insertId: number }).insertId, user.id]
        );
      });
    } catch (cause) {
      if (cause instanceof Error && !('code' in cause)) {
        return fail(422, { error: cause.message });
      }
      console.error('Concern submission failed:', cause);
      return fail(503, { error: 'The concern could not be submitted.' });
    }
    return { success: 'Your concern was submitted.' };
  },
  assign: async ({ request, locals }) => {
    const user = await requireUser(locals);
    if (!user.roles.includes('admin')) {
      return fail(403, { error: 'Only administrators can assign concerns.' });
    }
    const data = await request.formData();
    const concernId = field(data, 'concern_id');
    const staffId = field(data, 'staff_user_id');
    if (!/^\d+$/.test(concernId) || !/^\d+$/.test(staffId)) {
      return fail(422, { error: 'Select a concern and an active staff account.' });
    }
    try {
      await withTransaction(async (connection) => {
        const [concernRows] = await connection.execute<
          (RowDataPacket & { status: string; resident_user_id: number | null; concern_code: string })[]
        >(
          `SELECT c.status, r.user_id AS resident_user_id, c.concern_code
             FROM concerns AS c JOIN residents AS r ON r.resident_id = c.resident_id
            WHERE c.concern_id = ? FOR UPDATE`,
          [Number(concernId)]
        );
        const concern = concernRows[0];
        if (!concern || !['submitted', 'assigned', 'investigating', 'awaiting_resident'].includes(concern.status)) {
          throw new Error('This concern cannot be assigned.');
        }
        const [staffRows] = await connection.execute<RowDataPacket[]>(
          `SELECT u.user_id FROM users AS u
             JOIN user_roles AS ur ON ur.user_id = u.user_id
             JOIN roles AS r ON r.role_id = ur.role_id
            WHERE u.user_id = ? AND u.account_status = 'active' AND r.role_code = 'staff'`,
          [Number(staffId)]
        );
        if (!staffRows[0]) {
          throw new Error('The selected staff account is not active.');
        }
        await connection.execute(
          `UPDATE concern_assignments SET unassigned_at = UTC_TIMESTAMP(3)
            WHERE concern_id = ? AND unassigned_at IS NULL`,
          [Number(concernId)]
        );
        await connection.execute(
          `INSERT INTO concern_assignments (concern_id, staff_user_id, assigned_by_user_id)
           VALUES (?, ?, ?)`,
          [Number(concernId), Number(staffId), user.id]
        );
        if (concern.status === 'submitted') {
          await connection.execute(
            `UPDATE concerns SET status = 'assigned', closed_at = NULL WHERE concern_id = ?`,
            [Number(concernId)]
          );
          await connection.execute(
            `INSERT INTO concern_status_history (concern_id, from_status, to_status, changed_by_user_id, reason)
             VALUES (?, 'submitted', 'assigned', ?, 'Concern assigned to staff.')`,
            [Number(concernId), user.id]
          );
        }
        await connection.execute(
          `INSERT INTO notifications
             (user_id, notification_type, title, body, related_entity_type, related_entity_id)
           VALUES (?, 'concern', 'Concern assigned', ?, 'concern', ?)`,
          [Number(staffId), `Concern ${concern.concern_code} was assigned to you.`, Number(concernId)]
        );
        if (concern.resident_user_id !== null) {
          await connection.execute(
            `INSERT INTO notifications
               (user_id, notification_type, title, body, related_entity_type, related_entity_id)
             VALUES (?, 'concern', 'Concern assigned', ?, 'concern', ?)`,
            [concern.resident_user_id, `Concern ${concern.concern_code} has been assigned for review.`,
              Number(concernId)]
          );
        }
      });
    } catch (cause) {
      if (cause instanceof Error && !('code' in cause)) {
        return fail(422, { error: cause.message });
      }
      console.error('Concern assignment failed:', cause);
      return fail(503, { error: 'Concern assignment could not be saved.' });
    }
    return { success: 'Concern assigned.' };
  },
  updateStatus: async ({ request, locals }) => {
    const user = await requireUser(locals);
    if (!user.permissions.includes('concerns.assigned.update') ||
      (!user.roles.includes('admin') && !user.roles.includes('staff'))) {
      return fail(403, { error: 'Your account cannot update concerns.' });
    }
    const data = await request.formData();
    const concernId = field(data, 'concern_id');
    const nextStatus = field(data, 'status');
    const reason = field(data, 'reason');
    if (!/^\d+$/.test(concernId) || reason.length > 1000) {
      return fail(422, { error: 'Invalid concern update.' });
    }
    try {
      await withTransaction(async (connection) => {
        const [rows] = await connection.execute<
          (RowDataPacket & { status: string; resident_user_id: number | null; concern_code: string })[]
        >(
          `SELECT c.status, r.user_id AS resident_user_id, c.concern_code
             FROM concerns AS c JOIN residents AS r ON r.resident_id = c.resident_id
            WHERE c.concern_id = ? FOR UPDATE`,
          [Number(concernId)]
        );
        const concern = rows[0];
        if (!concern) {
          throw new Error('Concern was not found.');
        }
        if (!user.roles.includes('admin')) {
          const [assignments] = await connection.execute<RowDataPacket[]>(
            `SELECT assignment_id FROM concern_assignments
              WHERE concern_id = ? AND staff_user_id = ? AND unassigned_at IS NULL LIMIT 1`,
            [Number(concernId), user.id]
          );
          if (!assignments[0]) {
            throw new Error('This concern is not assigned to you.');
          }
        }
        if (!transitions[concern.status]?.includes(nextStatus)) {
          throw new Error(`The concern cannot move from ${concern.status} to ${nextStatus}.`);
        }
        await connection.execute(
          `UPDATE concerns SET status = ?,
             closed_at = IF(? IN ('closed', 'rejected', 'cancelled'), UTC_TIMESTAMP(3), NULL)
            WHERE concern_id = ?`,
          [nextStatus, nextStatus, Number(concernId)]
        );
        await connection.execute(
          `INSERT INTO concern_status_history (concern_id, from_status, to_status, changed_by_user_id, reason)
           VALUES (?, ?, ?, ?, NULLIF(?, ''))`,
          [Number(concernId), concern.status, nextStatus, user.id, reason]
        );
        if (concern.resident_user_id !== null) {
          await connection.execute(
            `INSERT INTO notifications
               (user_id, notification_type, title, body, related_entity_type, related_entity_id)
             VALUES (?, 'concern', 'Concern status updated', ?, 'concern', ?)`,
            [concern.resident_user_id,
              `Concern ${concern.concern_code} is now ${nextStatus.replaceAll('_', ' ')}.`,
              Number(concernId)]
          );
        }
      });
    } catch (cause) {
      if (cause instanceof Error && !('code' in cause)) {
        return fail(422, { error: cause.message });
      }
      console.error('Concern status update failed:', cause);
      return fail(503, { error: 'Concern status could not be updated.' });
    }
    return { success: 'Concern status updated.' };
  }
};
