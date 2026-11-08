import { createHash, randomBytes } from 'node:crypto';
import { redirect } from '@sveltejs/kit';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { getPool } from './db';

export const SESSION_COOKIE = 'brgy_session';
export const SESSION_SECONDS = 10 * 60 * 60;

type UserRow = RowDataPacket & {
  user_id: number;
  username: string;
  account_status: string;
};

function tokenDigest(token: string): Buffer {
  return createHash('sha256').update(token).digest();
}

export async function getSessionUser(token: string): Promise<NonNullable<App.Locals['user']> | null> {
  const pool = getPool();
  const digest = tokenDigest(token);
  const [rows] = await pool.execute<UserRow[]>(
    `SELECT u.user_id, u.username, u.account_status
       FROM app_sessions AS s
       JOIN users AS u ON u.user_id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP(3)
      LIMIT 1`,
    [digest]
  );
  const user = rows[0];
  if (!user || user.account_status !== 'active') {
    if (user) {
      await pool.execute('DELETE FROM app_sessions WHERE token_hash = ?', [digest]);
    }
    return null;
  }

  const [roleRows] = await pool.execute<(RowDataPacket & { role_code: string })[]>(
    `SELECT r.role_code
       FROM user_roles AS ur
       JOIN roles AS r ON r.role_id = ur.role_id
      WHERE ur.user_id = ?
      ORDER BY FIELD(r.role_code, 'admin', 'staff', 'resident')`,
    [user.user_id]
  );
  if (roleRows.length === 0) {
    await pool.execute('DELETE FROM app_sessions WHERE token_hash = ?', [digest]);
    return null;
  }

  const [grantedRows] = await pool.execute<(RowDataPacket & { permission_code: string })[]>(
    `SELECT p.permission_code, 'grant' AS effect
       FROM user_roles AS ur
       JOIN role_permissions AS rp ON rp.role_id = ur.role_id
       JOIN permissions AS p ON p.permission_id = rp.permission_id
      WHERE ur.user_id = ?`,
    [user.user_id]
  );
  const [overrideRows] = await pool.execute<
    (RowDataPacket & { permission_code: string; effect: 'allow' | 'deny' })[]
  >(
    `SELECT p.permission_code, upo.effect
       FROM user_permission_overrides AS upo
       JOIN permissions AS p ON p.permission_id = upo.permission_id
      WHERE upo.user_id = ?`,
    [user.user_id]
  );
  const decisions = new Set(grantedRows.map((row) => row.permission_code));
  for (const override of overrideRows) {
    if (override.effect === 'deny') {
      decisions.delete(override.permission_code);
    } else {
      decisions.add(override.permission_code);
    }
  }

  const permissions = [...decisions];
  await pool.execute(
    `UPDATE app_sessions SET last_seen_at = UTC_TIMESTAMP(3)
      WHERE token_hash = ?
        AND last_seen_at < DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 5 MINUTE)`,
    [digest]
  );

  return {
    id: Number(user.user_id),
    username: user.username,
    roles: roleRows.map((row) => row.role_code),
    permissions
  };
}

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const pool = getPool();
  await pool.execute('DELETE FROM app_sessions WHERE expires_at <= UTC_TIMESTAMP(3)');
  await pool.execute(
    `INSERT INTO app_sessions (token_hash, user_id, expires_at)
     VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(3), INTERVAL ? SECOND))`,
    [tokenDigest(token), userId, SESSION_SECONDS]
  );
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await getPool().execute('DELETE FROM app_sessions WHERE token_hash = ?', [tokenDigest(token)]);
}

export async function requireUser(locals: App.Locals): Promise<NonNullable<App.Locals['user']>> {
  if (!locals.user) {
    redirect(303, '/');
  }
  return locals.user;
}

export async function requirePermission(
  locals: App.Locals,
  permission: string
): Promise<NonNullable<App.Locals['user']>> {
  const user = await requireUser(locals);
  if (!user.permissions.includes(permission)) {
    redirect(303, '/dashboard?denied=1');
  }
  return user;
}

export async function withTransaction<T>(work: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
