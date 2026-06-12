// Remove duplicate test tenants, keep only rahul@loopwar.dev.
const Database = require('better-sqlite3');
const fs = require('fs');
const KEEP_EMAIL = 'rahul@loopwar.dev';
const db = Database('data/platform.db');
const all = db.prepare('SELECT id,email FROM tenants').all();
for (const t of all) {
  if (t.email === KEEP_EMAIL) continue;
  db.prepare('DELETE FROM tenants WHERE id=?').run(t.id);
  for (const ext of ['', '-wal', '-shm']) {
    try { fs.rmSync('data/tenants/' + t.id + '.db' + ext); } catch {}
  }
  try { fs.rmSync('auth/' + t.id, { recursive: true, force: true }); } catch {}
  console.log('deleted tenant', t.id, t.email);
}
console.log('remaining:', db.prepare('SELECT email FROM tenants').all().map((t) => t.email).join(', '));
