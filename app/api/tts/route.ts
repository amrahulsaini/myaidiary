export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Standard-C' // Basic voice that works with free tier
          },
          audioConfig: {
            audioEncoding: 'MP3'
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('TTS API Error Response:', data);
      return Response.json(
        { 
          error: data.error?.message || 'Failed to generate speech',
          details: data.error?.details || 'Unknown error'
        },
        { status: response.status }
      );
    }

    return Response.json({ audioContent: data.audioContent });
  } catch (error) {
    console.error('TTS Error:', error);
    return Response.json(
      { error: 'Failed to generate speech', details: String(error) },
      { status: 500 }
    );
  }
}
