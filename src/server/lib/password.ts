import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const SCRYPT_KEYLEN = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':');

  if (!salt || !hash) {
    return false;
  }

  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
  const stored = Buffer.from(hash, 'hex');

  if (stored.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(stored, derived);
}
