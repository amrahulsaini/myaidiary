import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign in" };

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const session = await auth();
  if (session?.user) redirect("/journal");

  const { mode } = await searchParams;
  const googleEnabled = !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

  return <AuthForm initialMode={mode === "signup" ? "signup" : "login"} googleEnabled={googleEnabled} />;
}
