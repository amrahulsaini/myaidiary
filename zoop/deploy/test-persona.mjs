import { GoogleGenAI } from '@google/genai';
import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
const env = fs.readFileSync('.env', 'utf8');
const apiKey = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim();
const mk = ((env.match(/^MASTER_KEY=(.*)$/m) || [])[1] || '').trim();
const MASTER = crypto.createHash('sha256').update(mk).digest();
const tkey = (id) => crypto.createHmac('sha256', MASTER).update('tenant:' + id).digest();
const dec = (blob, k) => { if (!blob || !blob.startsWith('v1:')) return blob; const raw = Buffer.from(blob.slice(3), 'base64'); const d = crypto.createDecipheriv('aes-256-gcm', k, raw.subarray(0, 12)); d.setAuthTag(raw.subarray(12, 28)); return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8'); };
const pdb = Database('data/platform.db');
const t = pdb.prepare("SELECT id FROM tenants WHERE email='rahul@loopwar.dev'").get();
const k = tkey(t.id);
const db = Database('data/tenants/' + t.id + '.db');
const persona = dec(db.prepare("SELECT value FROM settings WHERE key='persona'").get().value, k);
console.log('persona length:', persona.length);
const ai = new GoogleGenAI({ apiKey });
const SAFETY = ['HARASSMENT', 'HATE_SPEECH', 'SEXUALLY_EXPLICIT', 'DANGEROUS_CONTENT', 'CIVIC_INTEGRITY'].map((c) => ({ category: 'HARM_CATEGORY_' + c, threshold: 'BLOCK_NONE' }));
const sys = persona + '\n\nYou are in a GROUP chat — messages prefixed with sender name. Reply to the latest. Always set shouldReply=true.';
const contents = [
  { role: 'user', parts: [{ text: 'Harshit: Rahul zoop ko padha likha abhi kamjor hai' }] },
  { role: 'user', parts: [{ text: 'Rajat: Bc type hi karta rahega' }] },
  { role: 'user', parts: [{ text: 'Khetan: kisi kaam ka nahi hai zoop' }] },
];
const res = await ai.models.generateContent({
  model: 'gemini-2.5-flash', contents,
  config: { systemInstruction: sys, temperature: 0.9, maxOutputTokens: 500, thinkingConfig: { thinkingBudget: 0 }, safetySettings: SAFETY, responseMimeType: 'application/json', responseSchema: { type: 'object', properties: { reply: { type: 'string' }, important: { type: 'boolean' }, shouldReply: { type: 'boolean' } }, required: ['reply', 'important'] } },
});
console.log('TEXT:', JSON.stringify(res.text));
console.log('finishReason:', res.candidates?.[0]?.finishReason);
console.log('promptFeedback:', JSON.stringify(res.promptFeedback || {}));
console.log('usage:', JSON.stringify(res.usageMetadata || {}));
