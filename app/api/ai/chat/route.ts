import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, journalContext } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Build context from journal entries
    const contextSummary = journalContext && journalContext.length > 0
      ? journalContext.map((note: any) => 
          `Entry from ${new Date(note.updated_at).toLocaleDateString()}: "${note.title}" - ${note.content.substring(0, 200)}...`
        ).join("\n")
      : "No previous journal entries yet.";

    const prompt = `You are a compassionate, insightful AI therapist having a conversation with someone about their journal entries and emotions.

CONTEXT - Their Recent Journal Entries:
${contextSummary}

Their Current Message to You:
"${message}"

INSTRUCTIONS:
- Speak directly to them using "you" and "your"
- Reference specific things from their journal entries when relevant
- Be warm, supportive, and insightful
- Ask thoughtful follow-up questions
- Help them understand their emotional patterns
- Keep responses conversational and 2-4 sentences

Response:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return NextResponse.json(
        { error: "AI chat failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to listen. Could you tell me more?";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
