import type { MoodInsight } from "./types";

function countHits(text: string, words: string[]): number {
  let count = 0;
  for (const w of words) {
    const re = new RegExp(`\\b${escapeRegExp(w)}\\b`, "gi");
    const matches = text.match(re);
    if (matches) count += matches.length;
  }
  return count;
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

export function getMoodInsight(rawText: string): MoodInsight {
  const text = (rawText || "").trim();
  const lower = text.toLowerCase();

  if (!text) {
    return {
      label: "Neutral",
      confidence: "low",
      signals: ["No text yet"],
      suggestions: [
        "Write one sentence about what happened today.",
        "Add one thing you’re grateful for.",
      ],
      disclaimer:
        "This is a lightweight demo signal, not medical advice or diagnosis.",
    };
  }

  const positive = [
    "happy",
    "grateful",
    "proud",
    "excited",
    "calm",
    "relaxed",
    "love",
    "win",
    "great",
    "good",
  ];
  const stress = [
    "anxious",
    "stressed",
    "overwhelmed",
    "worried",
    "panic",
    "tired",
    "burnout",
    "sad",
    "angry",
    "upset",
  ];

  const posHits = countHits(lower, positive);
  const stressHits = countHits(lower, stress);

  const signals: string[] = [];
  if (posHits) signals.push(`Positive signals: ${posHits}`);
  if (stressHits) signals.push(`Stress signals: ${stressHits}`);

  const total = posHits + stressHits;
  const confidence: "low" | "medium" | "high" =
    total >= 6 ? "high" : total >= 3 ? "medium" : "low";

  let label: MoodInsight["label"] = "Neutral";
  if (posHits >= 2 && stressHits === 0) label = "Positive";
  else if (stressHits >= 2 && posHits === 0) label = "Stressed";
  else if (posHits > 0 && stressHits > 0) label = "Mixed";

  const suggestions: string[] = [];
  if (label === "Stressed") {
    suggestions.push(
      "Try a 2-minute reset: inhale 4, hold 4, exhale 6.",
      "Write the smallest next step you can do today.",
      "Name one thing you can control right now."
    );
  } else if (label === "Positive") {
    suggestions.push(
      "Capture what worked so you can repeat it.",
      "Write one thank-you note (even if you don’t send it)."
    );
  } else if (label === "Mixed") {
    suggestions.push(
      "Separate facts from feelings: what happened vs. what it meant.",
      "Write one lesson and one win from today."
    );
  } else {
    suggestions.push(
      "Write one highlight and one challenge from today.",
      "Add a small goal for tomorrow."
    );
  }

  return {
    label,
    confidence,
    signals: signals.length ? signals : ["No strong signals detected"],
    suggestions,
    disclaimer:
      "This is a lightweight demo signal, not medical advice or diagnosis.",
  };
}
