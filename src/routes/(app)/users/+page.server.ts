import { fail } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { Actions, PageServerLoad } from './$types';
import { requirePermission, withTransaction } from '../../../lib/server/auth';
import { getPool } from '../../../lib/server/db';

type Account = RowDataPacket & {
  user_id: number;
  username: string;
  email: string;
  account_status: string;
  created_at: Date;
  roles: string | null;
  resident_name: string | null;
};

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export const load: PageServerLoad = async ({ locals }) => {
  await requirePermission(locals, 'users.manage');
  const [accounts] = await getPool().query<Account[]>(
    `SELECT u.user_id, u.username, u.email, u.account_status, u.created_at,
            GROUP_CONCAT(r.role_code ORDER BY r.role_code SEPARATOR ', ') AS roles,
            MAX(CONCAT_WS(' ', p.first_name, p.last_name)) AS resident_name
       FROM users AS u
       LEFT JOIN user_roles AS ur ON ur.user_id = u.user_id
       LEFT JOIN roles AS r ON r.role_id = ur.role_id
       LEFT JOIN residents AS p ON p.user_id = u.user_id
      GROUP BY u.user_id
      ORDER BY FIELD(u.account_status, 'pending_approval', 'pending_email', 'active', 'suspended', 'deactivated'),
               u.created_at DESC`
  );
  const [roles] = await getPool().query<(RowDataPacket & { role_code: string; display_name: string })[]>(
    'SELECT role_code, display_name FROM roles ORDER BY role_code'
  );
  return { accounts, roles };
};

export const actions: Actions = {
  setStatus: async ({ request, locals, getClientAddress }) => {
    const actor = await requirePermission(locals, 'users.manage');
    const data = await request.formData();
    const targetId = field(data, 'user_id');
    const status = field(data, 'account_status');
    const allowed = ['pending_approval', 'active', 'suspended', 'deactivated'];
    if (!/^\d+$/.test(targetId) || !allowed.includes(status)) {
      return fail(422, { error: 'Invalid account or status.' });
    }
    if (Number(targetId) === actor.id) {
      return fail(422, { error: 'You cannot change your own account status.' });
    }

    try {
      await withTransaction(async (connection) => {
        const [currentRows] = await connection.execute<
          (RowDataPacket & { account_status: string; roles: number })[]
        >(
          `SELECT u.account_status, COUNT(ur.role_id) AS roles
             FROM users AS u LEFT JOIN user_roles AS ur ON ur.user_id = u.user_id
            WHERE u.user_id = ? GROUP BY u.user_id FOR UPDATE`,
          [Number(targetId)]
        );
        const current = currentRows[0];
        if (!current) {
          throw new Error('Account was not found.');
        }
        if (status === 'active' && Number(current.roles) === 0) {
          throw new Error('Assign at least one role before activating this account.');
        }
        if (current.account_status === 'active' && status !== 'active') {
          const [adminRows] = await connection.execute<(RowDataPacket & { count: number })[]>(
            `SELECT COUNT(DISTINCT u.user_id) AS count
               FROM users AS u
               JOIN user_roles AS ur ON ur.user_id = u.user_id
               JOIN roles AS r ON r.role_id = ur.role_id
              WHERE u.account_status = 'active' AND r.role_code = 'admin'`
          );
          const [targetRoles] = await connection.execute<(RowDataPacket & { is_admin: number })[]>(
            `SELECT EXISTS(
               SELECT 1 FROM user_roles AS ur JOIN roles AS r ON r.role_id = ur.role_id
                WHERE ur.user_id = ? AND r.role_code = 'admin'
             ) AS is_admin`,
            [Number(targetId)]
          );
          if (targetRoles[0]?.is_admin && Number(adminRows[0]?.count) <= 1) {
            throw new Error('The last active administrator cannot be deactivated.');
          }
        }
        await connection.execute('UPDATE users SET account_status = ? WHERE user_id = ?', [status, Number(targetId)]);
        await connection.execute(
          `INSERT INTO audit_logs (actor_user_id, action_code, entity_type, entity_id, ip_address, user_agent, metadata)
           VALUES (?, 'account.status.updated', 'users', ?, INET6_ATON(?), ?, JSON_OBJECT('status', ?))`,
          [actor.id, targetId, getClientAddress(), request.headers.get('user-agent')?.slice(0, 500) ?? null, status]
        );
      });
    } catch (error) {
      if (error instanceof Error && !('code' in error)) {
        return fail(422, { error: error.message });
      }
      console.error('Account status update failed:', error);
      return fail(503, { error: 'Account status could not be updated.' });
    }
    return { success: 'Account status updated.' };
  },
  setRole: async ({ request, locals, getClientAddress }) => {
    const actor = await requirePermission(locals, 'users.manage');
    const data = await request.formData();
    const targetId = field(data, 'user_id');
    const roleCode = field(data, 'role_code');
    const operation = field(data, 'operation');
    if (!/^\d+$/.test(targetId) || !/^[a-z_]{3,40}$/.test(roleCode) ||
      !['assign', 'remove'].includes(operation)) {
      return fail(422, { error: 'Invalid account role operation.' });
    }
    if (Number(targetId) === actor.id) {
      return fail(422, { error: 'You cannot change your own role assignments.' });
    }

    try {
      await withTransaction(async (connection) => {
        const [roleRows] = await connection.execute<(RowDataPacket & { role_id: number })[]>(
          'SELECT role_id FROM roles WHERE role_code = ?',
          [roleCode]
        );
        const role = roleRows[0];
        if (!role) {
          throw new Error('Role was not found.');
        }
        const [userRows] = await connection.execute<(RowDataPacket & { account_status: string })[]>(
          'SELECT account_status FROM users WHERE user_id = ? FOR UPDATE',
          [Number(targetId)]
        );
        if (!userRows[0]) {
          throw new Error('Account was not found.');
        }

        if (operation === 'assign') {
          const [result] = await connection.execute(
            `INSERT IGNORE INTO user_roles (user_id, role_id, assigned_by_user_id) VALUES (?, ?, ?)`,
            [Number(targetId), role.role_id, actor.id]
          );
          if ((result as { affectedRows: number }).affectedRows === 0) {
            throw new Error('That role is already assigned to this account.');
          }
        } else {
          if (roleCode === 'admin' && userRows[0].account_status === 'active') {
            const [adminRows] = await connection.execute<(RowDataPacket & { count: number })[]>(
              `SELECT COUNT(DISTINCT u.user_id) AS count
                 FROM users AS u
                 JOIN user_roles AS ur ON ur.user_id = u.user_id
                 JOIN roles AS r ON r.role_id = ur.role_id
                WHERE u.account_status = 'active' AND r.role_code = 'admin'`
            );
            if (Number(adminRows[0]?.count) <= 1) {
              throw new Error('The last active administrator role cannot be removed.');
            }
          }
          const [result] = await connection.execute(
            'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
            [Number(targetId), role.role_id]
          );
          if ((result as { affectedRows: number }).affectedRows !== 1) {
            throw new Error('That role is not assigned to this account.');
          }
        }
        await connection.execute(
          `INSERT INTO audit_logs (actor_user_id, action_code, entity_type, entity_id, ip_address, user_agent, metadata)
           VALUES (?, 'account.role.updated', 'users', ?, INET6_ATON(?), ?, JSON_OBJECT('role', ?, 'operation', ?))`,
          [actor.id, targetId, getClientAddress(), request.headers.get('user-agent')?.slice(0, 500) ?? null, roleCode, operation]
        );
      });
    } catch (error) {
      if (error instanceof Error && !('code' in error)) {
        return fail(422, { error: error.message });
      }
      console.error('Account role update failed:', error);
      return fail(503, { error: 'Account role could not be updated.' });
    }
    return { success: 'Account role updated.' };
  }
};
