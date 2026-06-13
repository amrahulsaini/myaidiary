import type { TenantDB } from './tenant-db.js';

// ============================================================
// Token-based billing — official Gemini API rates × 2 markup,
// charged to users in INR. Payment gateway is disabled for now;
// users get a free signup grant and admins can top up.
// ============================================================

// USD → INR conversion used for display & charging (editable).
export const USD_TO_INR = 86;

// We charge users DOUBLE the official Google Gemini cost.
export const MARKUP = 2;

// Free trial credits every new account starts with (INR).
export const SIGNUP_GRANT_INR = 50;

// Official Google Gemini API rates — USD per 1,000,000 tokens. [input, output].
// (These are Google's published rates; the user pays MARKUP × this.)
const RATES: Record<string, { in: number; out: number }> = {
  'gemini-2.5-flash':             { in: 0.30, out: 2.50 },
  'gemini-2.5-flash-lite':        { in: 0.10, out: 0.40 },
  'gemini-2.5-pro':               { in: 1.25, out: 10.00 },
  // TTS (voice notes): text tokens in, audio tokens out.
  'gemini-2.5-flash-preview-tts': { in: 0.50, out: 10.00 },
  'gemini-2.5-pro-preview-tts':   { in: 1.00, out: 20.00 },
};
const DEFAULT_RATE = RATES['gemini-2.5-flash'];

export interface Usage {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

// Pull token usage out of a Gemini API response (works for text, vision & TTS calls).
export function usageOf(res: any, model: string): Usage {
  const u = res?.usageMetadata || {};
  return {
    model,
    inputTokens: Number(u.promptTokenCount) || 0,
    outputTokens: Number(u.candidatesTokenCount ?? u.responseTokenCount) || 0,
  };
}

// ₹ a user is charged for one AI call = official cost × markup × USD→INR.
export function costInr(u: Usage): number {
  const r = RATES[u.model] || DEFAULT_RATE;
  const usd = (u.inputTokens / 1e6) * r.in + (u.outputTokens / 1e6) * r.out;
  return usd * MARKUP * USD_TO_INR;
}

// ---- wallet (balance kept in tenant settings, encrypted at rest) ----
export function getBalance(db: TenantDB): number {
  return Number(db.getSetting('wallet_balance_inr', '0')) || 0;
}
function setBalance(db: TenantDB, inr: number): void {
  db.setSetting('wallet_balance_inr', String(Math.max(0, inr)));
}
export function canSpend(db: TenantDB): boolean {
  return getBalance(db) > 0;
}

// Add credits (signup bonus / admin top-up / future recharge). Returns new balance.
export function grant(db: TenantDB, inr: number, note = 'grant'): number {
  const bal = getBalance(db) + inr;
  setBalance(db, bal);
  db.addLedger('grant', '', 0, 0, inr, bal, note);
  return bal;
}

// Charge the wallet for one AI call. Returns ₹ charged. Always records a ledger row.
export function charge(db: TenantDB, u: Usage, kind: string): number {
  const cost = costInr(u);
  if (cost <= 0) return 0;
  const bal = Math.max(0, getBalance(db) - cost);
  setBalance(db, bal);
  db.addLedger(kind, u.model, u.inputTokens, u.outputTokens, -cost, bal, '');
  return cost;
}

// Convenience: returns a charge closure bound to a tenant DB + kind, suitable as an `onUsage` callback.
export function charger(db: TenantDB, kind: string): (u: Usage) => void {
  return (u: Usage) => {
    try {
      charge(db, u, kind);
    } catch {
      /* never let billing crash the engine */
    }
  };
}
