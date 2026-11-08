import { fail } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { Actions, PageServerLoad } from './$types';
import { requirePermission, withTransaction } from '../../../lib/server/auth';
import { getPool } from '../../../lib/server/db';

type Household = RowDataPacket & {
  household_id: number;
  household_code: string;
  household_name: string | null;
  address_line: string;
  purok: string | null;
  head_resident_id: number | null;
  head_name: string | null;
  member_count: number;
  archived_at: Date | null;
};

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export const load: PageServerLoad = async ({ locals }) => {
  await requirePermission(locals, 'households.read');
  const [households] = await getPool().query<Household[]>(
    `SELECT h.household_id, h.household_code, h.household_name, h.address_line, h.purok,
            head.resident_id AS head_resident_id,
            CONCAT_WS(' ', head.first_name, head.middle_name, head.last_name, head.suffix) AS head_name,
            COUNT(DISTINCT hm.resident_id) AS member_count, h.archived_at
       FROM households AS h
       LEFT JOIN household_members AS hm
         ON hm.household_id = h.household_id AND hm.left_on IS NULL
       LEFT JOIN household_members AS head_member
         ON head_member.household_id = h.household_id
        AND head_member.left_on IS NULL AND head_member.is_head = TRUE
       LEFT JOIN residents AS head ON head.resident_id = head_member.resident_id
      GROUP BY h.household_id
      ORDER BY h.archived_at IS NOT NULL, h.household_code`
  );
  const [residents] = await getPool().query<(RowDataPacket & { resident_id: number; full_name: string })[]>(
    `SELECT resident_id, CONCAT_WS(' ', first_name, middle_name, last_name, suffix) AS full_name
       FROM residents WHERE record_status = 'active' ORDER BY last_name, first_name`
  );
  return { households, residents };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    const user = await requirePermission(locals, 'households.read');
    if (!user.roles.includes('admin')) {
      return fail(403, { error: 'Only administrators can change household records.' });
    }
    const data = await request.formData();
    const id = field(data, 'household_id');
    const name = field(data, 'household_name');
    const address = field(data, 'address_line');
    const purok = field(data, 'purok');
    const headId = field(data, 'head_resident_id');
    if (!address || address.length > 255 || name.length > 160 || purok.length > 80) {
      return fail(422, { error: 'Enter a valid address, household name, and purok.' });
    }
    if ((id && !/^\d+$/.test(id)) || (headId && !/^\d+$/.test(headId))) {
      return fail(422, { error: 'Invalid household or resident selection.' });
    }

    try {
      await withTransaction(async (connection) => {
        let householdId: number;
        if (id) {
          const [result] = await connection.execute(
            `UPDATE households SET household_name = NULLIF(?, ''), address_line = ?, purok = NULLIF(?, '')
              WHERE household_id = ? AND archived_at IS NULL`,
            [name, address, purok, Number(id)]
          );
          if ((result as { affectedRows: number }).affectedRows !== 1) {
            throw new Error('Household record was not found or is archived.');
          }
          householdId = Number(id);
        } else {
          const [result] = await connection.execute(
            `INSERT INTO households (household_code, household_name, address_line, purok)
             VALUES (?, NULLIF(?, ''), ?, NULLIF(?, ''))`,
            [`H-${crypto.randomUUID().replaceAll('-', '').slice(0, 24).toUpperCase()}`, name, address, purok]
          );
          householdId = Number((result as { insertId: number }).insertId);
        }

        await connection.execute(
          `UPDATE household_members SET is_head = FALSE
            WHERE household_id = ? AND left_on IS NULL AND is_head = TRUE`,
          [householdId]
        );
        if (headId) {
          const [existing] = await connection.execute<
            (RowDataPacket & { household_member_id: number; household_id: number })[]
          >(
            `SELECT household_member_id, household_id FROM household_members
              WHERE resident_id = ? AND left_on IS NULL FOR UPDATE`,
            [Number(headId)]
          );
          const member = existing[0];
          if (member && Number(member.household_id) !== householdId) {
            throw new Error('Selected resident is already an active member of another household.');
          }
          if (member) {
            await connection.execute(
              `UPDATE household_members SET is_head = TRUE, relationship_to_head = 'Head'
                WHERE household_member_id = ?`,
              [member.household_member_id]
            );
          } else {
            await connection.execute(
              `INSERT INTO household_members (household_id, resident_id, relationship_to_head, is_head, joined_on)
               VALUES (?, ?, 'Head', TRUE, UTC_DATE())`,
              [householdId, Number(headId)]
            );
          }
        }
      });
    } catch (error) {
      if (error instanceof Error && !('code' in error)) {
        return fail(422, { error: error.message });
      }
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
        return fail(409, { error: 'That resident is already assigned as an active household head.' });
      }
      console.error('Household update failed:', error);
      return fail(503, { error: 'Household records could not be saved.' });
    }
    return { success: 'Household record saved.' };
  },
  archive: async ({ request, locals }) => {
    const user = await requirePermission(locals, 'households.read');
    if (!user.roles.includes('admin')) {
      return fail(403, { error: 'Only administrators can archive household records.' });
    }
    const data = await request.formData();
    const id = field(data, 'household_id');
    if (!/^\d+$/.test(id)) {
      return fail(422, { error: 'Invalid household record.' });
    }
    await withTransaction(async (connection) => {
      const [result] = await connection.execute(
        `UPDATE households SET archived_at = UTC_TIMESTAMP(3)
          WHERE household_id = ? AND archived_at IS NULL`,
        [Number(id)]
      );
      if ((result as { affectedRows: number }).affectedRows !== 1) {
        throw new Error('Active household record was not found.');
      }
      await connection.execute(
        `UPDATE household_members SET left_on = UTC_DATE(), is_head = FALSE
          WHERE household_id = ? AND left_on IS NULL`,
        [Number(id)]
      );
    });
    return { success: 'Household archived. Existing household and membership records were retained.' };
  }
};
