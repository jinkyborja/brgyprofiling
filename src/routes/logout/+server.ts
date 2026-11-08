import { redirect } from '@sveltejs/kit';
import { destroySession, SESSION_COOKIE } from '../../lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get(SESSION_COOKIE);
  if (token) {
    await destroySession(token);
  }
  cookies.delete(SESSION_COOKIE, { path: '/' });
  redirect(303, '/');
};
