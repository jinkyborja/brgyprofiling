import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hash } from 'bcryptjs';
import { hashPassword, verifyPassword } from '../src/lib/server/password.ts';

test('new SvelteKit password hashes retain the PHP-compatible bcrypt prefix', async () => {
  const password = 'Barangay password 2026!';
  const stored = await hashPassword(password);

  assert.match(stored, /^\$2y\$12\$/);
  assert.equal(await verifyPassword(password, stored), true);
  assert.equal(await verifyPassword('incorrect password', stored), false);
});

test('bcrypt hashes using PHP’s $2y prefix are normalized for verification', async () => {
  const password = 'legacy account password';
  const phpStyleHash = (await hash(password, 4)).replace(/^\$2[ab]\$/, '$2y$');

  assert.equal(await verifyPassword(password, phpStyleHash), true);
});
