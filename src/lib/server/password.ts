import { compare, hash } from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const hashValue = await hash(password, 12);
  return hashValue.replace(/^\$2[ab]\$/, '$2y$');
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return compare(password, storedHash.replace(/^\$2y\$/, '$2b$'));
}
