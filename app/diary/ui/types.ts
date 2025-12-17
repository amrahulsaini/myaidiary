export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

export type MoodLabel = "Positive" | "Neutral" | "Mixed" | "Stressed";

export type MoodInsight = {
  label: MoodLabel;
  confidence: "low" | "medium" | "high";
  signals: string[];
  suggestions: string[];
  disclaimer: string;
};
