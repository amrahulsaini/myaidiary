import DashboardClient from "./ui/DashboardClient";

export const metadata = {
  title: "Dashboard · MyAIDiary",
  description: "Your day at a glance: notes, expenses, lena-dena, and tasks.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
