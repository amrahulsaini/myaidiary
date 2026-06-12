import fs from 'node:fs';
import path from 'node:path';
import { config, assertConfig } from './config.js';
import { clog } from './logger.js';
import { listTenants, createTenant } from './platform-db.js';
import { TenantDB } from './tenant-db.js';
import { manager } from './manager.js';
import { buildServer } from './server/app.js';

// One-time migration: turn the old single-tenant install into tenant #1 (preserve the live
// WhatsApp session + data so no relink is needed). Runs only when there are no tenants yet.
function migrateLegacy(): void {
  if (listTenants().length > 0) return;
  const legacyDb = 'data/zoop.db';
  const legacyAuth = config.paths.authDir; // 'auth'
  const hasAuth =
    fs.existsSync(legacyAuth) && fs.readdirSync(legacyAuth).some((f) => f.endsWith('.json'));
  const hasDb = fs.existsSync(legacyDb);
  if (!hasAuth && !hasDb) return;

  const email = (process.env.LEGACY_EMAIL || 'rahul@loopwar.dev').toLowerCase();
  const password = process.env.LEGACY_PASSWORD || 'zoop-admin';
  const t = createTenant(email, password);
  clog('info', 'migrate', `Migrating legacy install → tenant ${t.id} (${email})`);

  // move Baileys auth files into auth/<id>/
  if (hasAuth) {
    const dest = path.join(legacyAuth, t.id);
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(legacyAuth)) {
      const full = path.join(legacyAuth, f);
      if (f === t.id) continue;
      try {
        if (fs.statSync(full).isFile()) fs.renameSync(full, path.join(dest, f));
      } catch {
        /* ignore */
      }
    }
  }
  // move the legacy DB → data/tenants/<id>.db
  fs.mkdirSync(config.paths.tenantsDir, { recursive: true });
  for (const ext of ['', '-wal', '-shm']) {
    const src = legacyDb + ext;
    if (fs.existsSync(src)) {
      try {
        fs.renameSync(src, path.join(config.paths.tenantsDir, `${t.id}.db${ext}`));
      } catch {
        /* ignore */
      }
    }
  }
  // owner name for the migrated tenant
  const db = new TenantDB(t.id);
  if (!db.getSetting('owner_name')) db.setSetting('owner_name', 'Rahul');
  clog('info', 'migrate', `Legacy migration complete. Login: ${email} / password: ${password}`);
}

async function main() {
  for (const e of assertConfig()) clog('warn', 'config', e);
  migrateLegacy();

  const app = buildServer();
  app.listen(config.server.port, config.server.host, () =>
    clog('info', 'server', `Zoop platform on http://${config.server.host}:${config.server.port}`)
  );

  if (config.gemini.apiKey) await manager.bootAll();
  else clog('error', 'boot', 'GEMINI_API_KEY missing — tenant engines NOT started.');
}

main().catch((e) => {
  clog('error', 'app', 'fatal: ' + String(e?.stack || e));
  process.exit(1);
});
