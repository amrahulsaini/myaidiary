import Database from 'better-sqlite3';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { randomId } from './crypto.js';

fs.mkdirSync(config.paths.data, { recursive: true });

const pdb = new Database(config.paths.platformDb);
pdb.pragma('journal_mode = WAL');
pdb.exec(`
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`);

export interface Tenant {
  id: string;
  email: string;
  pass_hash: string;
  created_at: number;
}

export function createTenant(email: string, password: string): Tenant {
  const id = randomId();
  const pass_hash = bcrypt.hashSync(password, 10);
  pdb.prepare('INSERT INTO tenants(id, email, pass_hash, created_at) VALUES(?, ?, ?, ?)').run(
    id,
    email.toLowerCase().trim(),
    pass_hash,
    Date.now()
  );
  return getTenant(id)!;
}

export function getTenantByEmail(email: string): Tenant | undefined {
  return pdb.prepare('SELECT * FROM tenants WHERE email = ?').get(email.toLowerCase().trim()) as
    | Tenant
    | undefined;
}

export function getTenant(id: string): Tenant | undefined {
  return pdb.prepare('SELECT * FROM tenants WHERE id = ?').get(id) as Tenant | undefined;
}

export function listTenants(): Tenant[] {
  return pdb.prepare('SELECT * FROM tenants ORDER BY created_at ASC').all() as Tenant[];
}

export function verifyPassword(tenant: Tenant, password: string): boolean {
  return bcrypt.compareSync(password, tenant.pass_hash);
}

export function deleteTenant(id: string): void {
  pdb.prepare('DELETE FROM tenants WHERE id = ?').run(id);
}

// for migrating the legacy single-tenant install
export function createTenantWithId(id: string, email: string, password: string): Tenant {
  const pass_hash = bcrypt.hashSync(password, 10);
  pdb.prepare('INSERT OR IGNORE INTO tenants(id, email, pass_hash, created_at) VALUES(?, ?, ?, ?)').run(
    id,
    email.toLowerCase().trim(),
    pass_hash,
    Date.now()
  );
  return getTenant(id)!;
}
