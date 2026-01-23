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
            name: 'en-US-Neural2-F', // Natural female voice
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.95,
            pitch: 0
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.statusText}`);
    }

    const data = await response.json();
    return Response.json({ audioContent: data.audioContent });
  } catch (error) {
    console.error('TTS Error:', error);
    return Response.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
