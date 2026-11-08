import { error, fail } from '@sveltejs/kit';
import type { RowDataPacket } from 'mysql2';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '../../../lib/server/auth';
import { getPool } from '../../../lib/server/db';

type BarangayProfile = {
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  officeHours: string;
  about: string;
};

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function parseProfile(value: unknown): BarangayProfile {
  if (typeof value !== 'string') {
    error(500, 'Barangay profile setting has an invalid format.');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (cause) {
    console.error('Barangay profile setting contains invalid JSON:', cause);
    error(500, 'Barangay profile setting could not be read.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    error(500, 'Barangay profile setting has an invalid format.');
  }
  const record = parsed as Record<string, unknown>;
  const keys: (keyof BarangayProfile)[] = ['name', 'address', 'contactNumber', 'email', 'officeHours', 'about'];
  if (keys.some((key) => typeof record[key] !== 'string')) {
    error(500, 'Barangay profile setting has missing or invalid fields.');
  }
  return record as BarangayProfile;
}

export const load: PageServerLoad = async ({ locals }) => {
  const user = await requireUser(locals);
  const [rows] = await getPool().query<
    (RowDataPacket & { profile_json: string })[]
  >(
    `SELECT CAST(setting_value AS CHAR CHARACTER SET utf8mb4) AS profile_json
       FROM system_settings WHERE setting_key = 'barangay_profile'`
  );
  return {
    profile: rows[0] ? parseProfile(rows[0].profile_json) : null,
    canManage: user.permissions.includes('system.settings.manage')
  };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    const user = await requireUser(locals);
    if (!user.permissions.includes('system.settings.manage')) {
      return fail(403, { error: 'Your account cannot update barangay information.' });
    }
    const data = await request.formData();
    const profile: BarangayProfile = {
      name: field(data, 'name'),
      address: field(data, 'address'),
      contactNumber: field(data, 'contact_number'),
      email: field(data, 'email').toLowerCase(),
      officeHours: field(data, 'office_hours'),
      about: field(data, 'about')
    };
    if (!profile.name || profile.name.length > 180 ||
      profile.address.length > 500 || profile.contactNumber.length > 40 ||
      profile.email.length > 254 ||
      (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) ||
      profile.officeHours.length > 300 || profile.about.length > 5000) {
      return fail(422, { error: 'Check the barangay name, address, contact details, and profile text.' });
    }
    try {
      await getPool().execute(
        `INSERT INTO system_settings
           (setting_key, setting_value, description, updated_by_user_id)
         VALUES ('barangay_profile', CAST(? AS JSON), 'Barangay profile displayed in the signed-in information page.', ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value),
                                 description = VALUES(description),
                                 updated_by_user_id = VALUES(updated_by_user_id)`,
        [JSON.stringify(profile), user.id]
      );
    } catch (cause) {
      console.error('Barangay profile save failed:', cause);
      return fail(503, { error: 'Barangay information could not be saved.' });
    }
    return { success: 'Barangay information saved.' };
  }
};
