import DiaryClient from "./ui/DiaryClient";

export const metadata = {
  title: "Diary · MyAIDiary",
  description: "Write daily notes, save locally, and view lightweight mood insights.",
};

export default function DiaryPage() {
  return <DiaryClient />;
}
