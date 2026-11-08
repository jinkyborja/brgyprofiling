import { requireUser } from '../../lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => ({
  user: await requireUser(locals)
});
