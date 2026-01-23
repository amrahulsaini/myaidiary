import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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

    console.log('TTS Response:', JSON.stringify(response, null, 2));

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      console.error('No audio data in response. Full response:', response);
      return NextResponse.json(
        { error: 'No audio data returned from API', debug: response },
        { status: 500 }
      );
    }

    console.log('Audio data length:', audioData.length);
    console.log('Audio data preview:', audioData.substring(0, 100));

    return NextResponse.json({ audioContent: audioData });
  } catch (error: any) {
    console.error('TTS Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error.message || String(error) },
      { status: 500 }
    );
  }
}
