import { fail } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { Actions, PageServerLoad } from './$types';
import { requirePermission, requireUser } from '../../../lib/server/auth';
import { getPool } from '../../../lib/server/db';

type Announcement = RowDataPacket & {
  announcement_id: number;
  title: string;
  body: string;
  audience: 'public' | 'residents' | 'staff' | 'all_users';
  target_purok: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  publish_at: string | null;
  published_at: string | null;
  created_at: string;
};

const audiences = ['public', 'residents', 'staff', 'all_users'] as const;

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export const load: PageServerLoad = async ({ locals }) => {
  const user = await requirePermission(locals, 'announcements.read');
  const canManage = user.roles.includes('admin');
  let announcements: Announcement[];
  if (canManage) {
    [announcements] = await getPool().query<Announcement[]>(
      `SELECT announcement_id, title, body, audience, target_purok, status,
              publish_at, published_at, created_at
         FROM announcements
        ORDER BY FIELD(status, 'draft', 'scheduled', 'published', 'archived'),
                 COALESCE(publish_at, created_at) DESC, announcement_id DESC
        LIMIT 200`
    );
  } else {
    [announcements] = await getPool().execute<Announcement[]>(
      `SELECT a.announcement_id, a.title, a.body, a.audience, a.target_purok,
              a.status, a.publish_at, a.published_at, a.created_at
         FROM announcements AS a
        WHERE a.status = 'published'
          AND (a.publish_at IS NULL OR a.publish_at <= UTC_TIMESTAMP(3))
          AND (a.audience IN ('public', 'all_users')
               OR (? = 1 AND a.audience = 'residents')
               OR (? = 1 AND a.audience = 'staff'))
          AND (a.target_purok IS NULL OR EXISTS (
                SELECT 1
                  FROM residents AS r
                  JOIN household_members AS hm
                    ON hm.resident_id = r.resident_id AND hm.left_on IS NULL
                  JOIN households AS h
                    ON h.household_id = hm.household_id AND h.archived_at IS NULL
                 WHERE r.user_id = ? AND h.purok = a.target_purok
          ))
        ORDER BY COALESCE(a.publish_at, a.published_at, a.created_at) DESC,
                 a.announcement_id DESC
        LIMIT 200`,
      [user.roles.includes('resident') ? 1 : 0, user.roles.includes('staff') ? 1 : 0, user.id]
    );
  }
  return { announcements, canManage };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    const user = await requireUser(locals);
    if (!user.roles.includes('admin')) {
      return fail(403, { error: 'Only administrators can manage announcements.' });
    }

    const data = await request.formData();
    const id = field(data, 'announcement_id');
    const title = field(data, 'title');
    const body = field(data, 'body');
    const audience = field(data, 'audience');
    const purok = field(data, 'target_purok');
    if ((id && !/^\d+$/.test(id)) ||
      !title || title.length > 180 || !body || body.length > 20000 ||
      !audiences.includes(audience as (typeof audiences)[number]) ||
      purok.length > 80 || (purok && audience !== 'residents')) {
      return fail(422, { error: 'Check the title, announcement text, audience, and purok.' });
    }

    try {
      if (id) {
        const [result] = await getPool().execute(
          `UPDATE announcements SET title = ?, body = ?, audience = ?, target_purok = NULLIF(?, '')
            WHERE announcement_id = ?`,
          [title, body, audience, purok, Number(id)]
        );
        if ((result as { affectedRows: number }).affectedRows !== 1) {
          return fail(404, { error: 'Announcement was not found.' });
        }
      } else {
        await getPool().execute(
          `INSERT INTO announcements (title, body, audience, target_purok, created_by_user_id)
           VALUES (?, ?, ?, NULLIF(?, ''), ?)`,
          [title, body, audience, purok, user.id]
        );
      }
    } catch (cause) {
      console.error('Announcement save failed:', cause);
      return fail(503, { error: 'Announcement could not be saved.' });
    }
    return { success: 'Announcement saved.' };
  },
  updateStatus: async ({ request, locals }) => {
    const user = await requireUser(locals);
    if (!user.roles.includes('admin')) {
      return fail(403, { error: 'Only administrators can publish or archive announcements.' });
    }
    const data = await request.formData();
    const id = field(data, 'announcement_id');
    const status = field(data, 'status');
    if (!/^\d+$/.test(id) || !['draft', 'published', 'archived'].includes(status)) {
      return fail(422, { error: 'Invalid announcement update.' });
    }
    try {
      const [result] = await getPool().execute(
        `UPDATE announcements
            SET status = ?,
                publish_at = IF(? = 'published', UTC_TIMESTAMP(3), NULL),
                published_at = IF(? = 'published', UTC_TIMESTAMP(3), published_at),
                published_by_user_id = IF(? = 'published', ?, published_by_user_id)
          WHERE announcement_id = ?`,
        [status, status, status, status, user.id, Number(id)]
      );
      if ((result as { affectedRows: number }).affectedRows !== 1) {
        return fail(404, { error: 'Announcement was not found.' });
      }
    } catch (cause) {
      console.error('Announcement status update failed:', cause);
      return fail(503, { error: 'Announcement status could not be updated.' });
    }
    return { success: `Announcement ${status}.` };
  }
};
