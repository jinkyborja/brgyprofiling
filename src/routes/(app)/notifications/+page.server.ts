import { fail } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { Actions, PageServerLoad } from './$types';
import { requirePermission, requireUser } from '../../../lib/server/auth';
import { getPool } from '../../../lib/server/db';

type Notification = RowDataPacket & {
  notification_id: number;
  notification_type: string;
  title: string;
  body: string;
  related_entity_type: string | null;
  related_entity_id: number | null;
  created_at: string;
  read_at: string | null;
};

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export const load: PageServerLoad = async ({ locals }) => {
  const user = await requirePermission(locals, 'notifications.self.read');
  const [notifications] = await getPool().execute<Notification[]>(
    `SELECT notification_id, notification_type, title, body, related_entity_type,
            related_entity_id, created_at, read_at
       FROM notifications
      WHERE user_id = ?
      ORDER BY read_at IS NULL DESC, created_at DESC, notification_id DESC
      LIMIT 100`,
    [user.id]
  );
  const [counts] = await getPool().execute<(RowDataPacket & { unread: number })[]>(
    'SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND read_at IS NULL',
    [user.id]
  );
  return { notifications, unreadCount: Number(counts[0]?.unread ?? 0) };
};

export const actions: Actions = {
  markRead: async ({ request, locals }) => {
    const user = await requirePermission(locals, 'notifications.self.read');
    const data = await request.formData();
    const id = field(data, 'notification_id');
    if (!/^\d+$/.test(id)) {
      return fail(422, { error: 'Invalid notification.' });
    }

    try {
      const [result] = await getPool().execute(
        `UPDATE notifications SET read_at = UTC_TIMESTAMP(3)
          WHERE notification_id = ? AND user_id = ? AND read_at IS NULL`,
        [Number(id), user.id]
      );
      if ((result as { affectedRows: number }).affectedRows !== 1) {
        return fail(404, { error: 'Unread notification was not found.' });
      }
    } catch (cause) {
      console.error('Notification read update failed:', cause);
      return fail(503, { error: 'Notification could not be updated.' });
    }
    return { success: 'Notification marked as read.' };
  },
  markAllRead: async ({ locals }) => {
    const user = await requirePermission(locals, 'notifications.self.read');
    try {
      await getPool().execute(
        'UPDATE notifications SET read_at = UTC_TIMESTAMP(3) WHERE user_id = ? AND read_at IS NULL',
        [user.id]
      );
    } catch (cause) {
      console.error('Mark all notifications read failed:', cause);
      return fail(503, { error: 'Notifications could not be updated.' });
    }
    return { success: 'All notifications marked as read.' };
  }
};
