import { NextResponse } from 'next/server';

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

    // Use Google Cloud Text-to-Speech API instead
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Neural2-C' // High quality neural voice
          },
          audioConfig: {
            audioEncoding: 'MP3'
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('TTS API Error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Failed to generate speech' },
        { status: response.status }
      );
    }

    return NextResponse.json({ audioContent: data.audioContent });
  } catch (error: any) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error.message },
      { status: 500 }
    );
  }
}
