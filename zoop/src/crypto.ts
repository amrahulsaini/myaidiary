import crypto from 'node:crypto';
import { config } from './config.js';

// Server master key → never stored in any tenant DB. A DB-file leak is useless without it.
const MASTER = crypto.createHash('sha256').update(config.masterKey).digest(); // 32 bytes

// Each tenant gets a distinct key derived from the master + their id (so one tenant's leaked
// row can't be decrypted with another tenant's context).
export function tenantKey(tenantId: string): Buffer {
  return crypto.createHmac('sha256', MASTER).update('tenant:' + tenantId).digest();
}

const PREFIX = 'v1:';

// AES-256-GCM. Output: "v1:" + base64(iv | tag | ciphertext)
export function encrypt(plain: string | null | undefined, key: Buffer): string | null {
  if (plain === null || plain === undefined) return plain ?? null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, enc]).toString('base64');
}

// Decrypt. Legacy plaintext (no prefix) passes straight through, so migration is seamless.
export function decrypt(blob: string | null | undefined, key: Buffer): string {
  if (blob === null || blob === undefined) return '';
  if (typeof blob !== 'string' || !blob.startsWith(PREFIX)) return blob as string;
  try {
    const raw = Buffer.from(blob.slice(PREFIX.length), 'base64');
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const enc = raw.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch {
    return ''; // wrong key / corrupt → fail closed rather than leak garbage
  }
}

export function isEncrypted(blob: unknown): boolean {
  return typeof blob === 'string' && blob.startsWith(PREFIX);
}

// Raw-bytes AES-256-GCM for binary media (photos/voice). Output buffer: iv | tag | ciphertext.
// Kept separate from encrypt() so we don't base64-bloat large media before storing.
export function encryptBuffer(buf: Buffer, key: Buffer): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(buf), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]);
}
export function decryptBuffer(blob: Buffer, key: Buffer): Buffer {
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const enc = blob.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]);
}

export function randomId(bytes = 9): string {
  return crypto.randomBytes(bytes).toString('base64url');
}
