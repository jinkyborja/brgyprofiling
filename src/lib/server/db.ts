import { readFileSync } from 'node:fs';
import { createPool, type Pool } from 'mysql2/promise';

const globalForPool = globalThis as typeof globalThis & { brgyPool?: Pool };

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required database environment variable: ${name}`);
  }
  return value;
}

function getSslCa(): string {
  const caSetting = requiredEnvironment('DB_SSL_CA');
  if (caSetting.includes('-----BEGIN CERTIFICATE-----')) {
    return caSetting;
  }

  try {
    return readFileSync(caSetting, 'utf8');
  } catch (error) {
    throw new Error(`DB_SSL_CA must contain a PEM certificate or point to a readable CA file: ${String(error)}`);
  }
}

export function getPool(): Pool {
  if (!globalForPool.brgyPool) {
    const portValue = requiredEnvironment('DB_PORT');
    const port = Number(portValue);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('DB_PORT must be a valid TCP port.');
    }

    globalForPool.brgyPool = createPool({
      host: requiredEnvironment('DB_HOST'),
      port,
      database: requiredEnvironment('DB_NAME'),
      user: requiredEnvironment('DB_USER'),
      password: requiredEnvironment('DB_PASSWORD'),
      ssl: {
        ca: getSslCa(),
        rejectUnauthorized: true
      },
      charset: 'utf8mb4',
      timezone: 'Z',
      dateStrings: true,
      connectionLimit: 3,
      waitForConnections: true,
      queueLimit: 0,
      enableKeepAlive: true
    });
  }

  return globalForPool.brgyPool;
}
