import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

function createWavHeader(dataLength: number, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const buffer = Buffer.alloc(44);
  
  // "RIFF" chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  
  // "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, 28); // ByteRate
  buffer.writeUInt16LE(channels * bitsPerSample / 8, 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  // "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  
  return buffer;
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const pcmData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!pcmData) {
      console.error('No audio data in response:', response);
      return NextResponse.json(
        { error: 'No audio data returned from API' },
        { status: 500 }
      );
    }

    // Convert base64 PCM to buffer
    const pcmBuffer = Buffer.from(pcmData, 'base64');
    
    // Create WAV header for the PCM data
    const wavHeader = createWavHeader(pcmBuffer.length);
    
    // Combine header and PCM data
    const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
    
    // Convert back to base64
    const wavBase64 = wavBuffer.toString('base64');

    return NextResponse.json({ audioContent: wavBase64 });
  } catch (error: any) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error.message || String(error) },
      { status: 500 }
    );
  }
}
