import { Metadata } from "next";
import DashboardClient from "./ui/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard · MyAIDiary",
  description: "Your day at a glance: notes, expenses, lena-dena, and tasks.",
};

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <DashboardClient />;
}
