import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
const env = fs.readFileSync('.env', 'utf8');
const key = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim();
const ai = new GoogleGenAI({ apiKey: key });
const SAFETY = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
];
const contents = [
  { role: 'user', parts: [{ text: 'Harshit: Zoop ki gand marr gayi' }] },
  { role: 'user', parts: [{ text: 'Rajat: Bc type hi karta rahega' }] },
  { role: 'user', parts: [{ text: 'Khetan: kisi kaam ka nahi hai zoop' }] },
];
async function run(label, cfg) {
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents, config: cfg });
    console.log(`\n[${label}] text=`, JSON.stringify(res.text));
    console.log(`[${label}] finishReason=`, res.candidates?.[0]?.finishReason, '| promptFeedback=', JSON.stringify(res.promptFeedback || {}));
    console.log(`[${label}] safetyRatings=`, JSON.stringify(res.candidates?.[0]?.safetyRatings || []));
  } catch (e) { console.log(`[${label}] ERROR:`, e.message); }
}
const base = { systemInstruction: 'You are Zoop, a witty WhatsApp assistant in a group. Reply to the latest message, clap back playfully. Keep it short.', temperature: 0.9, maxOutputTokens: 500, thinkingConfig: { thinkingBudget: 0 }, safetySettings: SAFETY };
await run('JSON+safety', { ...base, responseMimeType: 'application/json', responseSchema: { type: 'object', properties: { reply: { type: 'string' }, important: { type: 'boolean' }, shouldReply: { type: 'boolean' } }, required: ['reply', 'important'] } });
await run('plain+safety', { ...base });
await run('plain+nosafety', { systemInstruction: base.systemInstruction, temperature: 0.9, maxOutputTokens: 500, thinkingConfig: { thinkingBudget: 0 } });
