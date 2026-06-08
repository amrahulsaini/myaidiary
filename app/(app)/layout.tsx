import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AppNav from "@/components/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  return (
    <>
      <AppNav />
      {children}
    </>
  );
}
