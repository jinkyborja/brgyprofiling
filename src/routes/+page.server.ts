import { fail, redirect } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { Actions, PageServerLoad } from './$types';
import { createSession, SESSION_COOKIE, SESSION_SECONDS, withTransaction } from '../lib/server/auth';
import { getPool } from '../lib/server/db';
import { hashPassword, verifyPassword } from '../lib/server/password';

export const load: PageServerLoad = ({ locals }) => {
  if (locals.user) {
    redirect(303, '/dashboard');
  }
  return {};
};

function formString(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export const actions: Actions = {
  login: async ({ request, cookies, url }) => {
    const data = await request.formData();
    const login = formString(data, 'username');
    const passwordEntry = data.get('password');
    const password = typeof passwordEntry === 'string' ? passwordEntry : '';

    if (!login || !password) {
      return fail(400, { loginError: 'Enter your username or email and password.' });
    }

    const [rows] = await getPool().execute<
      (RowDataPacket & { user_id: number; username: string; password_hash: string; account_status: string })[]
    >(
      `SELECT user_id, username, password_hash, account_status
         FROM users
        WHERE username = ? OR email = ?
        LIMIT 1`,
      [login, login]
    );
    const user = rows[0];
    const validPassword = user ? await verifyPassword(password, user.password_hash) : false;

    if (!user || !validPassword) {
      return fail(401, { loginError: 'Invalid username/email or password.' });
    }
    if (user.account_status !== 'active') {
      return fail(403, {
        loginError: user.account_status === 'pending_approval'
          ? 'Your account request is awaiting administrator approval.'
          : 'This account is not currently allowed to sign in.'
      });
    }

    const token = await createSession(Number(user.user_id));
    cookies.set(SESSION_COOKIE, token, {
      path: '/',
      httpOnly: true,
      secure: url.protocol === 'https:',
      sameSite: 'lax',
      maxAge: SESSION_SECONDS
    });
    redirect(303, '/dashboard');
  },
  register: async ({ request }) => {
    const data = await request.formData();
    const firstName = formString(data, 'first_name');
    const lastName = formString(data, 'last_name');
    const email = formString(data, 'email').toLowerCase();
    const username = formString(data, 'new_username');
    const passwordEntry = data.get('new_password');
    const password = typeof passwordEntry === 'string' ? passwordEntry : '';

    if (
      !firstName || firstName.length > 100 ||
      !lastName || lastName.length > 100 ||
      email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^[A-Za-z0-9._-]{3,80}$/.test(username) ||
      Buffer.byteLength(password, 'utf8') < 12 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      return fail(422, {
        registerError: 'Check the required fields. Use a valid email, a 3–80 character username, and a password of 12–72 bytes.'
      });
    }

    const passwordHash = await hashPassword(password);
    try {
      await withTransaction(async (connection) => {
        const [userResult] = await connection.execute(
          `INSERT INTO users (username, email, password_hash, account_status)
           VALUES (?, ?, ?, 'pending_approval')`,
          [username, email, passwordHash]
        );
        const userId = Number((userResult as { insertId: number }).insertId);
        await connection.execute(
          `INSERT INTO residents (user_id, resident_code, first_name, last_name, verification_status)
           VALUES (?, ?, ?, ?, 'pending_review')`,
          [userId, `R-${crypto.randomUUID().replaceAll('-', '').slice(0, 24).toUpperCase()}`, firstName, lastName]
        );
        const [roleResult] = await connection.execute(
          `INSERT INTO user_roles (user_id, role_id)
           SELECT ?, role_id FROM roles WHERE role_code = 'resident'`,
          [userId]
        );
        if ((roleResult as { affectedRows: number }).affectedRows !== 1) {
          throw new Error('Resident role is not configured in the database.');
        }
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
        return fail(409, { registerError: 'That username or email is already in use.' });
      }
      console.error('Resident account registration failed:', error);
      return fail(503, { registerError: 'Account requests are temporarily unavailable. Please try again later.' });
    }

    return {
      registerSuccess: 'Your resident account request was submitted. You can sign in after an administrator approves it.'
    };
  }
};
