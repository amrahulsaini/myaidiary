import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { expenses } = await request.json();

    if (!expenses || !Array.isArray(expenses)) {
      return NextResponse.json({ error: "Expenses array is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const expensesSummary = expenses
      .map((e) => `${e.description || "Unknown"}: $${e.amount} (${e.category})`)
      .join("\n");

    const prompt = `Analyze these recent expenses and provide spending insights (3-4 sentences):

${expensesSummary}

Provide:
1. Spending patterns you notice
2. Recommendations to save money
3. Budget optimization tips

Response format: Plain text, conversational tone.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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
        { error: "AI analysis failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to analyze";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Expense analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
