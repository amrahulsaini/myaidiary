import crypto from 'node:crypto';
import { config } from './config.js';
import { clog } from './logger.js';

// ============================================================
// Razorpay UPI QR recharge.
//
// We use the QR Codes API (https://razorpay.com/docs/payments/qr-codes/apis/)
// to mint a single-use, fixed-amount UPI QR per top-up. The user scans it with
// ANY UPI app and pays — no redirect to a Razorpay checkout page. We then learn
// the payment either by polling the QR (frontend → /api/recharge/status) or via
// the qr_code.credited webhook, and credit the wallet idempotently.
//
// Credentials come from the server env ONLY (config.razorpay.*), never git.
// ============================================================

const API = 'https://api.razorpay.com/v1';

export function enabled(): boolean {
  return !!(config.razorpay.keyId && config.razorpay.keySecret);
}

function authHeader(): string {
  const pair = `${config.razorpay.keyId}:${config.razorpay.keySecret}`;
  return 'Basic ' + Buffer.from(pair).toString('base64');
}

async function rzp(path: string, method: 'GET' | 'POST', body?: unknown): Promise<any> {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const msg = json?.error?.description || `Razorpay ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export interface QrCreated {
  id: string;
  imageUrl: string;
  amountInr: number;
}

// Create a single-use, fixed-amount UPI QR for `amountInr` rupees, tagged with the tenant id
// (so the webhook / status check can attribute the payment to the right wallet).
export async function createQr(amountInr: number, tenantId: string): Promise<QrCreated> {
  const j = await rzp('/payments/qr_codes', 'POST', {
    type: 'upi_qr',
    name: 'Zoop credits',
    usage: 'single_use',
    fixed_amount: true,
    payment_amount: Math.round(amountInr * 100), // paise
    description: `Zoop credit recharge (₹${amountInr})`,
    // auto-expire the QR in 15 minutes so stale codes can't be paid later.
    close_by: Math.floor(Date.now() / 1000) + 15 * 60,
    notes: { tenantId, purpose: 'zoop_recharge' },
  });
  return { id: j.id, imageUrl: j.image_url, amountInr };
}

export interface QrStatus {
  id: string;
  status: string; // active | closed
  receivedInr: number; // total rupees actually received on this QR
  tenantId: string;
}

// Fetch a QR's current state — receivedInr > 0 means the user has paid.
export async function getQr(qrId: string): Promise<QrStatus> {
  const j = await rzp(`/payments/qr_codes/${encodeURIComponent(qrId)}`, 'GET');
  return {
    id: j.id,
    status: j.status,
    receivedInr: (Number(j.payments_amount_received) || 0) / 100,
    tenantId: String(j?.notes?.tenantId || ''),
  };
}

export async function closeQr(qrId: string): Promise<void> {
  try {
    await rzp(`/payments/qr_codes/${encodeURIComponent(qrId)}/close`, 'POST');
  } catch (e: any) {
    clog('warn', 'razorpay', 'closeQr failed: ' + String(e?.message || e));
  }
}

// Verify a webhook payload signature (HMAC-SHA256 of the raw body with the webhook secret).
export function verifyWebhook(rawBody: Buffer | string, signature: string): boolean {
  if (!config.razorpay.webhookSecret || !signature) return false;
  const expected = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
