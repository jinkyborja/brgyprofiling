import { fail } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { Actions, PageServerLoad } from './$types';
import { getPool } from '../../../lib/server/db';
import { requireUser } from '../../../lib/server/auth';

type Official = RowDataPacket & {
  official_id: number;
  official_code: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  position_title: string;
  term_start: string | null;
  term_end: string | null;
  contact_number: string | null;
  email: string | null;
  is_active: number;
};

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export const load: PageServerLoad = async ({ locals }) => {
  const user = await requireUser(locals);
  const [officials] = await getPool().query<Official[]>(
    `SELECT official_id, official_code, first_name, middle_name, last_name, suffix,
    position_title, term_start, term_end, contact_number, email, is_active
       FROM officials ORDER BY is_active DESC, last_name, first_name`
  );
  return { officials, canManage: user.roles.includes('admin') };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    if (!locals.user?.roles.includes('admin')) {
      return fail(403, { error: 'Only administrators can change official records.' });
    }
    const data = await request.formData();
    const id = field(data, 'official_id');
    const first = field(data, 'first_name');
    const middle = field(data, 'middle_name');
    const last = field(data, 'last_name');
    const suffix = field(data, 'suffix');
    const position = field(data, 'position_title');
    const start = field(data, 'term_start');
    const end = field(data, 'term_end');
    const contact = field(data, 'contact_number');
    const email = field(data, 'email').toLowerCase();
    if (!first || !last || !position || first.length > 100 || middle.length > 100 ||
      last.length > 100 || suffix.length > 20 || position.length > 120 || contact.length > 32) {
      return fail(422, { error: 'Enter valid names, position, and contact details.' });
    }
    if ((start && !/^\d{4}-\d{2}-\d{2}$/.test(start)) ||
      (end && !/^\d{4}-\d{2}-\d{2}$/.test(end)) ||
      (start && end && end < start)) {
      return fail(422, { error: 'The term end date must be on or after the term start date.' });
    }
    if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return fail(422, { error: 'Enter a valid email address.' });
    }
    if (id && !/^\d+$/.test(id)) {
      return fail(422, { error: 'Invalid official record.' });
    }

    if (id) {
      const [result] = await getPool().execute(
        `UPDATE officials
            SET first_name = ?, middle_name = NULLIF(?, ''), last_name = ?,
                suffix = NULLIF(?, ''), position_title = ?, term_start = NULLIF(?, ''),
                term_end = NULLIF(?, ''), contact_number = NULLIF(?, ''),
                email = NULLIF(?, '')
          WHERE official_id = ?`,
        [first, middle, last, suffix, position, start, end, contact, email, Number(id)]
      );
      if ((result as { affectedRows: number }).affectedRows !== 1) {
        return fail(404, { error: 'Official record was not found.' });
      }
    } else {
      await getPool().execute(
        `INSERT INTO officials (official_code, first_name, middle_name, last_name, suffix,
                                position_title, term_start, term_end, contact_number, email)
         VALUES (?, ?, NULLIF(?, ''), ?, NULLIF(?, ''), ?, NULLIF(?, ''), NULLIF(?, ''),
                 NULLIF(?, ''), NULLIF(?, ''))`,
        [`O-${crypto.randomUUID().replaceAll('-', '').slice(0, 24).toUpperCase()}`,
          first, middle, last, suffix, position, start, end, contact, email]
      );
    }
    return { success: 'Official record saved.' };
  },
  deactivate: async ({ request, locals }) => {
    if (!locals.user?.roles.includes('admin')) {
      return fail(403, { error: 'Only administrators can change official records.' });
    }
    const data = await request.formData();
    const id = field(data, 'official_id');
    if (!/^\d+$/.test(id)) {
      return fail(422, { error: 'Invalid official record.' });
    }
    const [result] = await getPool().execute(
      'UPDATE officials SET is_active = FALSE WHERE official_id = ? AND is_active = TRUE',
      [Number(id)]
    );
    if ((result as { affectedRows: number }).affectedRows !== 1) {
      return fail(404, { error: 'Active official record was not found.' });
    }
    return { success: 'Official record marked inactive.' };
  }
};
