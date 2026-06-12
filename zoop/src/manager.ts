import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { TenantDB } from './tenant-db.js';
import { TenantSession } from './session.js';
import { listTenants } from './platform-db.js';
import { clog } from './logger.js';

class Manager {
  private sessions = new Map<string, TenantSession>();
  private dbs = new Map<string, TenantDB>();

  getDb(tenantId: string): TenantDB {
    let db = this.dbs.get(tenantId);
    if (!db) {
      db = new TenantDB(tenantId);
      this.dbs.set(tenantId, db);
    }
    return db;
  }

  get(tenantId: string): TenantSession | undefined {
    return this.sessions.get(tenantId);
  }

  async startTenant(tenantId: string): Promise<TenantSession> {
    let session = this.sessions.get(tenantId);
    if (session) return session;
    const db = this.getDb(tenantId);
    session = new TenantSession(tenantId, db);
    this.sessions.set(tenantId, session);
    session.start().catch((e) => clog('error', 'manager', `tenant ${tenantId} start failed: ${String(e?.message || e)}`));
    return session;
  }

  async bootAll(): Promise<void> {
    const tenants = listTenants();
    clog('info', 'manager', `Booting ${tenants.length} tenant session(s)`);
    for (const t of tenants) {
      await this.startTenant(t.id);
      await new Promise((r) => setTimeout(r, 1500)); // stagger so we don't hammer WhatsApp at once
    }
  }

  // fully remove a tenant: stop + unlink WhatsApp, close + delete DB, delete auth files
  async deleteTenant(id: string): Promise<void> {
    const s = this.sessions.get(id);
    if (s) {
      await s.stop(true).catch(() => {});
      this.sessions.delete(id);
    }
    const db = this.dbs.get(id);
    if (db) {
      db.close();
      this.dbs.delete(id);
    }
    for (const ext of ['', '-wal', '-shm']) {
      const f = path.join(config.paths.tenantsDir, `${id}.db${ext}`);
      try {
        if (fs.existsSync(f)) fs.rmSync(f);
      } catch {
        /* ignore */
      }
    }
    try {
      fs.rmSync(path.join(config.paths.authDir, id), { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    clog('info', 'manager', `Deleted tenant ${id}`);
  }
}

export const manager = new Manager();
