import 'dotenv/config';

function str(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}
function num(key: string, fallback: number): number {
  const v = process.env[key];
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}
function bool(key: string, fallback: boolean): boolean {
  const v = process.env[key];
  if (v === undefined) return fallback;
  return v === 'true' || v === '1' || v === 'yes';
}

export const config = {
  gemini: {
    apiKey: str('GEMINI_API_KEY'), // shared key — the platform operator pays for all tenants
    // extra keys (comma-separated GEMINI_API_KEYS, and/or GEMINI_API_KEY_2/3/...) used to ROTATE on
    // 429 quota errors — mainly for TTS, whose daily request cap is low. Each key = its own quota.
    apiKeys: [
      str('GEMINI_API_KEY'),
      ...str('GEMINI_API_KEYS').split(',').map((k) => k.trim()),
      str('GEMINI_API_KEY_2'), str('GEMINI_API_KEY_3'), str('GEMINI_API_KEY_4'),
    ].filter((k, i, a) => k && a.indexOf(k) === i),
    model: str('GEMINI_MODEL', 'gemini-2.5-flash'),
  },
  server: {
    port: num('PORT', 3001),
    host: str('HOST', '0.0.0.0'),
    sessionSecret: str('SESSION_SECRET', 'insecure-dev-secret'),
  },
  // master key for encryption-at-rest. MUST be set & stable in prod (changing it = data unreadable).
  masterKey: str('MASTER_KEY') || str('SESSION_SECRET', 'insecure-dev-secret'),
  reply: {
    mode: str('REPLY_MODE', 'auto') as 'auto' | 'approval' | 'off',
    dmOnly: bool('DM_ONLY', true),
    minDelayMs: num('MIN_REPLY_DELAY_MS', 400),
    maxDelayMs: num('MAX_REPLY_DELAY_MS', 1500),
    burstDebounceMs: num('BURST_DEBOUNCE_MS', 1200),
    maxPerMinute: num('MAX_REPLIES_PER_MINUTE', 30),
    minGapPerContactMs: num('MIN_GAP_PER_CONTACT_MS', 1500),
  },
  summarizeEveryN: num('SUMMARIZE_EVERY_N_MESSAGES', 4),
  paths: {
    data: 'data',
    platformDb: 'data/platform.db',
    tenantsDir: 'data/tenants', // data/tenants/<id>.db
    authDir: 'auth', // auth/<id>/  (Baileys multi-file state per tenant)
  },
};

export function assertConfig(): string[] {
  const errors: string[] = [];
  if (!config.gemini.apiKey) errors.push('GEMINI_API_KEY is not set');
  if (!str('MASTER_KEY')) errors.push('MASTER_KEY not set — using SESSION_SECRET as fallback (set MASTER_KEY in prod)');
  return errors;
}
