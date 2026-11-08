import { error } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { PageServerLoad } from './$types';
import { requireUser } from '../../../../lib/server/auth';
import { getPool } from '../../../../lib/server/db';

type CertificateRecord = RowDataPacket & {
  certificate_code: string;
  certificate_type: string;
  recipient_name: string;
  recipient_address: string;
  purpose: string;
  date_issued: string;
  valid_until: string | null;
  remarks: string | null;
};

export const load: PageServerLoad = async ({ locals, params }) => {
  const user = await requireUser(locals);
  if (!user.roles.includes('admin')) {
    error(403, 'Only administrators can print certificate records.');
  }
  if (!/^\d+$/.test(params.certificateId)) {
    error(404, 'Certificate record not found.');
  }

  const [records] = await getPool().execute<CertificateRecord[]>(
    `SELECT certificate_code, certificate_type, recipient_name, recipient_address,
            purpose, date_issued, valid_until, remarks
       FROM certificate_records
      WHERE certificate_record_id = ? AND status = 'Issued' AND archived_at IS NULL`,
    [Number(params.certificateId)]
  );
  if (!records[0]) {
    error(404, 'Issued certificate record not found.');
  }
  return { certificate: records[0] };
};
