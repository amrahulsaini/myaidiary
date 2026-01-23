# Text-to-Speech (TTS) Feature

## Overview
MyAIDiary now uses **Google Gemini 2.5 Flash TTS** to convert your diary entries into natural-sounding speech.

## How to Use
1. Open any diary entry in the editor
2. Click the **"Listen"** button (speaker icon) next to the Delete button
3. The AI will read your entry aloud using the "Kore" voice
4. Click **"Stop"** to pause playback

## Technical Details

### API Endpoint
- **Route**: `/api/tts`
- **Method**: POST
- **Model**: `gemini-2.5-flash-preview-tts`
- **Voice**: Kore (prebuilt voice)

### Request Format
```json
{
  "text": "Your diary entry text here"
}
```

### Response Format
```json
{
  "audioContent": "base64-encoded-wav-audio"
}
```

### Implementation
- **Backend**: Next.js API route (`app/api/tts/route.ts`)
- **Frontend**: React component with audio controls (`app/diary/ui/DiaryClient.tsx`)
- **Audio Format**: WAV (PCM, 24kHz, 16-bit)
- **Provider**: Google Gemini AI API

## Environment Variables
Make sure `GEMINI_API_KEY` is set in your `.env.local`:

```env
GEMINI_API_KEY=your_api_key_here
```

## Features
- ✅ Natural-sounding AI voice (Kore)
- ✅ Play/Stop controls
- ✅ Loading indicator
- ✅ Error handling
- ✅ Auto-cleanup on playback end
- ✅ Disabled when no content

## Future Enhancements
- Multiple voice options
- Speed controls
- Download audio file
- Highlight text as it's being read
- Voice selection preferences per user
