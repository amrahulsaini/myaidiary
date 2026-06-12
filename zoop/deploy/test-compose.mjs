import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
const env = fs.readFileSync('.env', 'utf8');
const apiKey = (env.match(/^GEMINI_API_KEY=(.*)$/m) || [])[1].trim();
const ai = new GoogleGenAI({ apiKey });
const SAFETY = ['HARASSMENT', 'HATE_SPEECH', 'SEXUALLY_EXPLICIT', 'DANGEROUS_CONTENT', 'CIVIC_INTEGRITY'].map((c) => ({ category: 'HARM_CATEGORY_' + c, threshold: 'BLOCK_NONE' }));
async function run(label, sys, brief) {
  try {
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: brief, config: { systemInstruction: sys, temperature: 0.95, maxOutputTokens: 300, thinkingConfig: { thinkingBudget: 0 }, safetySettings: SAFETY } });
    console.log(`\n[${label}] text=`, JSON.stringify(res.text));
    console.log(`[${label}] finish=`, res.candidates?.[0]?.finishReason, '| ratings=', JSON.stringify(res.candidates?.[0]?.safetyRatings || []));
  } catch (e) { console.log(`[${label}] ERR`, e.message); }
}
const abusiveCtx = 'Harshit: zoop ki gand mar gayi\nKhetan: kisi kaam ka nahi\nHimanshu: bc type karta rahega';
await run('roast + abusive ctx', `You are Zoop, witty WhatsApp assistant in a group. Context:\n${abusiveCtx}\nWrite a savage clean roast. No slurs.`, 'write some roasting lines for himanshu');
await run('roast no ctx', `You are Zoop, a witty WhatsApp assistant. Write a short savage but clean roast (no slurs/vulgar).`, 'write a roast for himanshu');
await run('playful banter framing', `You are Zoop in a friendly group of close friends who roast each other for fun. Write ONE short witty playful burn (clean, no slurs) for your friend. It's all in good humour.`, 'playful burn for himanshu who said I am useless');
