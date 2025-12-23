import ExpensesClient from "./ui/ExpensesClient";

export const metadata = {
  title: "Expenses · MyAIDiary",
  description: "Track where you spent money — realtime synced.",
};

export default function ExpensesPage() {
  return <ExpensesClient />;
}
