import { fail } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { Actions, PageServerLoad } from './$types';
import { requirePermission, withTransaction } from '../../../lib/server/auth';
import { getPool } from '../../../lib/server/db';

type Resident = RowDataPacket & {
  resident_id: number;
  resident_code: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  birth_date: string | null;
  sex: string | null;
  civil_status: string | null;
  education: string | null;
  disability: string | null;
  religion: string | null;
  contact_number: string | null;
  verification_status: string;
  record_status: string;
  household_id: number | null;
  relationship_to_head: string | null;
};

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export const load: PageServerLoad = async ({ locals }) => {
  await requirePermission(locals, 'residents.read');
  const [residents] = await getPool().query<Resident[]>(
    `SELECT r.resident_id, r.resident_code, r.first_name, r.middle_name, r.last_name, r.suffix,
            r.birth_date, r.sex, r.civil_status, r.education, r.disability, r.religion,
            r.contact_number, r.verification_status,
            r.record_status, hm.household_id, hm.relationship_to_head
       FROM residents AS r
       LEFT JOIN household_members AS hm ON hm.resident_id = r.resident_id AND hm.left_on IS NULL
      ORDER BY r.last_name, r.first_name, r.resident_id DESC`
  );
  const [households] = await getPool().query<(RowDataPacket & { household_id: number; household_code: string; household_name: string | null })[]>(
    `SELECT household_id, household_code, household_name FROM households
      WHERE archived_at IS NULL ORDER BY household_code`
  );
  return { residents, households };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    const user = await requirePermission(locals, 'residents.read');
    if (!user.roles.includes('admin')) {
      return fail(403, { error: 'Only administrators can change resident records.' });
    }

    const data = await request.formData();
    const id = field(data, 'resident_id');
    const firstName = field(data, 'first_name');
    const middleName = field(data, 'middle_name');
    const lastName = field(data, 'last_name');
    const suffix = field(data, 'suffix');
    const birthDate = field(data, 'birth_date');
    const sex = field(data, 'sex');
    const civilStatus = field(data, 'civil_status');
    const education = field(data, 'education');
    const disability = field(data, 'disability');
    const religion = field(data, 'religion');
    const contactNumber = field(data, 'contact_number');
    const householdId = field(data, 'household_id');
    const relationship = field(data, 'relationship_to_head');
    if (!firstName || firstName.length > 100 || !lastName || lastName.length > 100) {
      return fail(422, { error: 'First and last names are required and must be 100 characters or fewer.' });
    }
    if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return fail(422, { error: 'Enter a valid birth date.' });
    }
    if (middleName.length > 100 || suffix.length > 20 || sex.length > 32 ||
      civilStatus.length > 32 || education.length > 80 || disability.length > 120 ||
      religion.length > 120 || contactNumber.length > 32 || relationship.length > 40) {
      return fail(422, { error: 'One or more optional fields are too long.' });
    }
    if ((id && !/^\d+$/.test(id)) ||
      (householdId && !/^\d+$/.test(householdId)) ||
      (householdId && !relationship)) {
      return fail(422, { error: 'Choose a valid household and provide the resident relationship to its head.' });
    }

    try {
      await withTransaction(async (connection) => {
        let residentId: number;
        if (id) {
          residentId = Number(id);
          const [current] = await connection.execute<RowDataPacket[]>(
            'SELECT resident_id FROM residents WHERE resident_id = ? FOR UPDATE',
            [residentId]
          );
          if (!current[0]) {
            throw new Error('Resident record was not found.');
          }
          await connection.execute(
            `UPDATE residents
                SET first_name = ?, middle_name = NULLIF(?, ''), last_name = ?,
                    suffix = NULLIF(?, ''), birth_date = NULLIF(?, ''),
                    sex = NULLIF(?, ''), civil_status = NULLIF(?, ''),
                education = NULLIF(?, ''), disability = NULLIF(?, ''),
                religion = NULLIF(?, ''), contact_number = NULLIF(?, '')
              WHERE resident_id = ?`,
            [firstName, middleName, lastName, suffix, birthDate, sex, civilStatus,
              education, disability, religion, contactNumber, residentId]
          );
        } else {
          const [result] = await connection.execute(
            `INSERT INTO residents (resident_code, first_name, middle_name, last_name, suffix,
                                    birth_date, sex, civil_status, education, disability, religion, contact_number)
             VALUES (?, ?, NULLIF(?, ''), ?, NULLIF(?, ''), NULLIF(?, ''),
                     NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''),
                     NULLIF(?, ''), NULLIF(?, ''))`,
            [`R-${crypto.randomUUID().replaceAll('-', '').slice(0, 24).toUpperCase()}`,
              firstName, middleName, lastName, suffix, birthDate, sex, civilStatus,
              education, disability, religion, contactNumber]
          );
          residentId = Number((result as { insertId: number }).insertId);
        }

        const [membershipRows] = await connection.execute<
          (RowDataPacket & { household_member_id: number; household_id: number })[]
        >(
          `SELECT household_member_id, household_id FROM household_members
            WHERE resident_id = ? AND left_on IS NULL FOR UPDATE`,
          [residentId]
        );
        const membership = membershipRows[0];
        if (membership && Number(membership.household_id) !== Number(householdId)) {
          await connection.execute(
            `UPDATE household_members SET left_on = UTC_DATE(), is_head = FALSE
              WHERE household_member_id = ?`,
            [membership.household_member_id]
          );
        }
        if (householdId) {
          const [householdRows] = await connection.execute<RowDataPacket[]>(
            'SELECT household_id FROM households WHERE household_id = ? AND archived_at IS NULL FOR UPDATE',
            [Number(householdId)]
          );
          if (!householdRows[0]) {
            throw new Error('The selected household was not found or is archived.');
          }
          const isHead = relationship.toLowerCase() === 'head';
          if (membership && Number(membership.household_id) === Number(householdId)) {
            await connection.execute(
              `UPDATE household_members SET relationship_to_head = ?, is_head = ?
                WHERE household_member_id = ?`,
              [relationship, isHead, membership.household_member_id]
            );
          } else {
            await connection.execute(
              `INSERT INTO household_members (household_id, resident_id, relationship_to_head, is_head, joined_on)
               VALUES (?, ?, ?, ?, UTC_DATE())`,
              [Number(householdId), residentId, relationship, isHead]
            );
          }
        }
      });
    } catch (error) {
      if (error instanceof Error && !('code' in error)) {
        return fail(422, { error: error.message });
      }
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
        return fail(409, { error: 'The resident is already assigned to another household or the household already has a head.' });
      }
      console.error('Resident update failed:', error);
      return fail(503, { error: 'Resident record could not be saved.' });
    }
    return { success: 'Resident record saved.' };
  },
  archive: async ({ request, locals }) => {
    const user = await requirePermission(locals, 'residents.read');
    if (!user.roles.includes('admin')) {
      return fail(403, { error: 'Only administrators can change resident records.' });
    }
    const data = await request.formData();
    const id = field(data, 'resident_id');
    if (!/^\d+$/.test(id)) {
      return fail(422, { error: 'Invalid resident record.' });
    }
    try {
      await withTransaction(async (connection) => {
        const [result] = await connection.execute(
          `UPDATE residents SET record_status = 'inactive'
            WHERE resident_id = ? AND record_status = 'active'`,
          [Number(id)]
        );
        if ((result as { affectedRows: number }).affectedRows !== 1) {
          throw new Error('Active resident record was not found.');
        }
        await connection.execute(
          `UPDATE household_members SET left_on = UTC_DATE(), is_head = FALSE
            WHERE resident_id = ? AND left_on IS NULL`,
          [Number(id)]
        );
      });
    } catch (error) {
      if (error instanceof Error && !('code' in error)) {
        return fail(404, { error: error.message });
      }
      console.error('Resident status update failed:', error);
      return fail(503, { error: 'Resident status could not be updated.' });
    }
    return { success: 'Resident record marked inactive.' };
  }
};
