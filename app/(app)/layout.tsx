import Link from "next/link";
import {
  BookOpenText,
  LayoutDashboard,
  Receipt,
  HandCoins,
  ListTodo,
  LogOut,
} from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Demo mode - no authentication required
  const user = { email: "demo@myaidiary.me" };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-300/35 blur-3xl dark:bg-indigo-500/10 myaidiary-float" />
        <div className="absolute left-[6%] top-[55%] h-[22rem] w-[22rem] rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/10 myaidiary-float" />
        <div className="absolute right-[8%] top-[35%] h-[26rem] w-[26rem] rounded-full bg-fuchsia-300/20 blur-3xl dark:bg-fuchsia-500/10 myaidiary-float" />
      </div>

      <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-zinc-50/70 backdrop-blur dark:border-white/10 dark:bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-3">
              <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white/60 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                <img src="/brand.svg" alt="MyAIDiary" className="h-full w-full" />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-semibold leading-tight tracking-tight">
                  MyAIDiary
                </span>
                <span className="text-xs leading-tight text-zinc-500 dark:text-zinc-400">
                  {user.email ?? ""}
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-2 overflow-x-auto">
              <TopNavItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
              <TopNavItem href="/notes" icon={<BookOpenText className="h-4 w-4" />} label="Notes" />
              <TopNavItem href="/expenses" icon={<Receipt className="h-4 w-4" />} label="Expenses" />
              <TopNavItem href="/debts" icon={<HandCoins className="h-4 w-4" />} label="Lena-Dena" />
              <TopNavItem href="/todos" icon={<ListTodo className="h-4 w-4" />} label="To-do" />
            </nav>
          </div>

          <Link href="/">
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-4 text-sm font-semibold text-zinc-900 backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10">
              <LogOut className="h-4 w-4" />
              Sign out (Demo)
            </button>
          </Link>
        </div>
      </header>

      <main className="relative">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

function TopNavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex h-10 items-center gap-2 rounded-full border border-transparent px-3 text-sm font-semibold text-zinc-700 transition-all duration-300 hover:border-zinc-200 hover:bg-white hover:text-zinc-950 dark:text-zinc-200 dark:hover:border-white/10 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-zinc-200 bg-white/70 text-zinc-900 shadow-sm shadow-black/5 transition group-hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
