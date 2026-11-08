import { error, fail, redirect } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { Actions, PageServerLoad } from './$types';
import { requirePermission, requireUser, withTransaction } from '../../../lib/server/auth';
import { getPool } from '../../../lib/server/db';

type Thread = RowDataPacket & {
  thread_id: number;
  subject: string;
  created_at: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
};

type ThreadMessage = RowDataPacket & {
  message_id: number;
  sender_user_id: number;
  sender_username: string;
  body: string;
  sent_at: string;
};

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = await requirePermission(locals, 'messages.read');
  const threadValue = url.searchParams.get('thread');
  if (threadValue && !/^\d+$/.test(threadValue)) {
    error(400, 'Invalid message thread.');
  }
  const [threads] = await getPool().execute<Thread[]>(
    `SELECT mt.thread_id, mt.subject, mt.created_at,
            (SELECT m.body FROM messages AS m
              WHERE m.thread_id = mt.thread_id
              ORDER BY m.sent_at DESC, m.message_id DESC LIMIT 1) AS last_message,
            (SELECT m.sent_at FROM messages AS m
              WHERE m.thread_id = mt.thread_id
              ORDER BY m.sent_at DESC, m.message_id DESC LIMIT 1) AS last_message_at,
            (SELECT COUNT(*) FROM messages AS m
              WHERE m.thread_id = mt.thread_id AND m.sender_user_id <> ?
                AND (tp.last_read_at IS NULL OR m.sent_at > tp.last_read_at)) AS unread_count
       FROM thread_participants AS tp
       JOIN message_threads AS mt ON mt.thread_id = tp.thread_id
      WHERE tp.user_id = ?
      ORDER BY last_message_at DESC, mt.thread_id DESC
      LIMIT 100`,
    [user.id, user.id]
  );

  let selectedThread: Thread | null = null;
  let messages: ThreadMessage[] = [];
  if (threadValue) {
    const [selectedRows] = await getPool().execute<Thread[]>(
      `SELECT mt.thread_id, mt.subject, mt.created_at, NULL AS last_message,
              NULL AS last_message_at, 0 AS unread_count
         FROM message_threads AS mt
         JOIN thread_participants AS tp ON tp.thread_id = mt.thread_id
        WHERE mt.thread_id = ? AND tp.user_id = ?`,
      [Number(threadValue), user.id]
    );
    if (!selectedRows[0]) {
      error(404, 'Message thread not found.');
    }
    selectedThread = selectedRows[0];
    [messages] = await getPool().execute<ThreadMessage[]>(
      `SELECT m.message_id, m.sender_user_id, u.username AS sender_username, m.body, m.sent_at
         FROM messages AS m
         JOIN users AS u ON u.user_id = m.sender_user_id
        WHERE m.thread_id = ?
        ORDER BY m.sent_at DESC, m.message_id DESC
        LIMIT 300`,
      [Number(threadValue)]
    );
    messages.reverse();
    await getPool().execute(
      'UPDATE thread_participants SET last_read_at = UTC_TIMESTAMP(3) WHERE thread_id = ? AND user_id = ?',
      [Number(threadValue), user.id]
    );
  }

  const [recipients] = await getPool().query<
    (RowDataPacket & { user_id: number; username: string; role_code: string })[]
  >(
    `SELECT DISTINCT u.user_id, u.username, r.role_code
       FROM users AS u
       JOIN user_roles AS ur ON ur.user_id = u.user_id
       JOIN roles AS r ON r.role_id = ur.role_id
      WHERE u.account_status = 'active' AND u.user_id <> ?
        AND (? = 1 OR r.role_code = 'resident')
      ORDER BY u.username`,
    [user.id, user.roles.includes('admin') ? 1 : 0]
  );
  return {
    threads,
    selectedThread,
    messages,
    recipients,
    canCreateThread: user.permissions.includes('messages.send') &&
      (user.roles.includes('admin') || user.roles.includes('staff')),
    username: user.username
  };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const user = await requirePermission(locals, 'messages.send');
    if (!user.roles.includes('admin') && !user.roles.includes('staff')) {
      return fail(403, { error: 'Your account cannot start message threads.' });
    }
    const data = await request.formData();
    const recipientId = field(data, 'recipient_user_id');
    const subject = field(data, 'subject');
    const body = field(data, 'body');
    if (!/^\d+$/.test(recipientId) || !subject || subject.length > 180 ||
      !body || body.length > 5000 || Number(recipientId) === user.id) {
      return fail(422, { error: 'Choose a recipient and enter a subject and message.' });
    }

    let threadId: number;
    try {
      threadId = await withTransaction(async (connection) => {
        const [recipientRows] = await connection.execute<
          (RowDataPacket & { user_id: number })[]
        >(
          `SELECT u.user_id FROM users AS u
             JOIN user_roles AS ur ON ur.user_id = u.user_id
             JOIN roles AS r ON r.role_id = ur.role_id
            WHERE u.user_id = ? AND u.account_status = 'active'
              AND (? = 1 OR r.role_code = 'resident')
            LIMIT 1`,
          [Number(recipientId), user.roles.includes('admin') ? 1 : 0]
        );
        if (!recipientRows[0]) {
          throw new Error('The selected recipient is not available for messaging.');
        }
        const [threadResult] = await connection.execute(
          'INSERT INTO message_threads (subject, created_by_user_id) VALUES (?, ?)',
          [subject, user.id]
        );
        const id = Number((threadResult as { insertId: number }).insertId);
        await connection.execute(
          'INSERT INTO thread_participants (thread_id, user_id) VALUES (?, ?), (?, ?)',
          [id, user.id, id, Number(recipientId)]
        );
        await connection.execute(
          'INSERT INTO messages (thread_id, sender_user_id, body) VALUES (?, ?, ?)',
          [id, user.id, body]
        );
        await connection.execute(
          `INSERT INTO notifications
             (user_id, notification_type, title, body, related_entity_type, related_entity_id)
           VALUES (?, 'message', 'New message', ?, 'message_thread', ?)`,
          [Number(recipientId), `You have a new message from ${user.username}.`, id]
        );
        return id;
      });
    } catch (cause) {
      if (cause instanceof Error && !('code' in cause)) {
        return fail(422, { error: cause.message });
      }
      console.error('Message thread creation failed:', cause);
      return fail(503, { error: 'Message thread could not be created.' });
    }
    redirect(303, `/messages?thread=${threadId}`);
  },
  send: async ({ request, locals }) => {
    const user = await requirePermission(locals, 'messages.send');
    const data = await request.formData();
    const threadId = field(data, 'thread_id');
    const body = field(data, 'body');
    if (!/^\d+$/.test(threadId) || !body || body.length > 5000) {
      return fail(422, { error: 'Enter a message of up to 5,000 characters.' });
    }
    try {
      await withTransaction(async (connection) => {
        const [participantRows] = await connection.execute<RowDataPacket[]>(
          `SELECT user_id FROM thread_participants
            WHERE thread_id = ? FOR UPDATE`,
          [Number(threadId)]
        );
        if (!participantRows.some((row) => Number(row.user_id) === user.id)) {
          throw new Error('You are not a participant in this thread.');
        }
        await connection.execute(
          'INSERT INTO messages (thread_id, sender_user_id, body) VALUES (?, ?, ?)',
          [Number(threadId), user.id, body]
        );
        for (const participant of participantRows) {
          const recipientId = Number(participant.user_id);
          if (recipientId === user.id) {
            continue;
          }
          await connection.execute(
            `INSERT INTO notifications
               (user_id, notification_type, title, body, related_entity_type, related_entity_id)
             VALUES (?, 'message', 'New message', ?, 'message_thread', ?)`,
            [recipientId, `There is a new message in a conversation with ${user.username}.`, Number(threadId)]
          );
        }
      });
    } catch (cause) {
      if (cause instanceof Error && !('code' in cause)) {
        return fail(403, { error: cause.message });
      }
      console.error('Message send failed:', cause);
      return fail(503, { error: 'Message could not be sent.' });
    }
    return { success: 'Message sent.' };
  }
};
