import type { Handle } from '@sveltejs/kit/hooks';
import { getSessionUser } from './lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = event.cookies.get('brgy_session')
    ? await getSessionUser(event.cookies.get('brgy_session')!)
    : null;

  return resolve(event);
};
