import TodosClient from "./ui/TodosClient";

export const metadata = {
  title: "To-do · MyAIDiary",
  description: "Plan your day and mark tasks done — realtime synced.",
};

export default function TodosPage() {
  return <TodosClient />;
}
