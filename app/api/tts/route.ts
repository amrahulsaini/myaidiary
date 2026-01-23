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

    // Use Gemini Flash TTS (try 2.0 if 2.5 doesn't work)
    const model = 'gemini-2.0-flash-exp';
    console.log('Using TTS model:', model);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: text
            }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Kore'
                }
              }
            }
          }
        })
      }
    );

    const data = await response.json();
    
    console.log('TTS API Response Status:', response.status);
    console.log('TTS API Response Data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('TTS API Error Response:', data);
      return NextResponse.json(
        { 
          error: data.error?.message || 'Failed to generate speech',
          details: data.error?.details || data.error || 'Unknown error',
          fullResponse: data
        },
        { status: response.status }
      );
    }

    // Extract audio data from Gemini response
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      console.error('No audio data in response. Full response:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { 
          error: 'No audio data returned from API',
          details: 'Check server logs for full response',
          fullResponse: data
        },
        { status: 500 }
      );
    }

    // Validate the audio data is not just placeholder
    if (audioData.length < 100 || /^[A,\s]+$/.test(audioData.slice(0, 100))) {
      console.error('Invalid audio data received:', audioData.slice(0, 200));
      return NextResponse.json(
        { 
          error: 'Invalid audio data received from API',
          details: 'Audio data appears to be empty or corrupted'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ audioContent: audioData });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech', details: String(error) },
      { status: 500 }
    );
  }
}
