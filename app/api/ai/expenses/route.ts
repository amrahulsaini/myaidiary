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

    const prompt = `You are a personal finance advisor analyzing someone's expenses. Speak directly to them and provide structured insights.

Their recent expenses:
${expensesSummary}

Provide a structured analysis in this exact format:

📊 SPENDING PATTERNS
• [Key observation 1]
• [Key observation 2]
• [Key observation 3]

💡 MONEY-SAVING TIPS
• [Actionable tip 1]
• [Actionable tip 2]
• [Actionable tip 3]

🎯 BUDGET OPTIMIZATION
• [Strategy 1]
• [Strategy 2]

Keep each bullet point concise (1 sentence max). Be direct and actionable.`;

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
