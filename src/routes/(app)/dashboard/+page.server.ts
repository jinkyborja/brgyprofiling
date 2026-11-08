import type { PageServerLoad } from './$types';
import type { RowDataPacket } from 'mysql2';
import { getPool } from '../../../lib/server/db';

export const load: PageServerLoad = async () => {
  const [rows] = await getPool().query<
    (RowDataPacket & {
      residents: number;
      households: number;
      officials: number;
      requests: number;
      pending_accounts: number;
    })[]
  >(
    `SELECT
       (SELECT COUNT(*) FROM residents WHERE record_status = 'active') AS residents,
       (SELECT COUNT(*) FROM households WHERE archived_at IS NULL) AS households,
       (SELECT COUNT(*) FROM officials WHERE is_active = TRUE) AS officials,
       (SELECT COUNT(*) FROM document_requests WHERE status NOT IN ('released', 'cancelled')) AS requests,
       (SELECT COUNT(*) FROM users WHERE account_status = 'pending_approval') AS pending_accounts`
  );
  return { counts: rows[0] };
};
