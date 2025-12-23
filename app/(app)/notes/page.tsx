import NotesClient from "./ui/NotesClient";

export const metadata = {
  title: "Notes · MyAIDiary",
  description: "Write notes and diary entries, synced in realtime.",
};

export default function NotesPage() {
  return <NotesClient />;
}
