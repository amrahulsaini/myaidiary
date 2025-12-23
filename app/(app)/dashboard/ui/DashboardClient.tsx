"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  Receipt,
  HandCoins,
  ListTodo,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser";

type NoteRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type ExpenseRow = {
  id: string;
  amount: string | number;
  currency: string;
  category: string;
  description: string;
  spent_at: string;
};

type DebtRow = {
  id: string;
  person: string;
  direction: "lent" | "borrowed";
  amount: string | number;
  currency: string;
  status: "open" | "settled";
};

type TodoRow = {
  id: string;
  title: string;
  status: "open" | "done" | "canceled";
  due_at: string | null;
};

export default function DashboardClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      const { data } = await supabase.auth.getUser();
      if (ignore) return;
      const uid = data.user?.id ?? null;
      setUserId(uid);
      await refreshAll();
      setLoading(false);
    }

    async function refreshAll() {
      const [n, e, d, t] = await Promise.all([
        supabase
          .from("notes")
          .select("id,title,content,created_at,updated_at")
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("expenses")
          .select("id,amount,currency,category,description,spent_at")
          .order("spent_at", { ascending: false })
          .limit(5),
        supabase
          .from("debts")
          .select("id,person,direction,amount,currency,status")
          .eq("status", "open")
          .order("occurred_at", { ascending: false })
          .limit(5),
        supabase
          .from("todos")
          .select("id,title,status,due_at")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(7),
      ]);

      if (n.data) setNotes(n.data as NoteRow[]);
      if (e.data) setExpenses(e.data as ExpenseRow[]);
      if (d.data) setDebts(d.data as DebtRow[]);
      if (t.data) setTodos(t.data as TodoRow[]);
    }

    bootstrap();

    return () => {
      ignore = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes", filter: `user_id=eq.${userId}` },
        () => supabase
          .from("notes")
          .select("id,title,content,created_at,updated_at")
          .order("updated_at", { ascending: false })
          .limit(5)
          .then(({ data }) => data && setNotes(data as NoteRow[]))
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${userId}` },
        () => supabase
          .from("expenses")
          .select("id,amount,currency,category,description,spent_at")
          .order("spent_at", { ascending: false })
          .limit(5)
          .then(({ data }) => data && setExpenses(data as ExpenseRow[]))
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "debts", filter: `user_id=eq.${userId}` },
        () => supabase
          .from("debts")
          .select("id,person,direction,amount,currency,status")
          .eq("status", "open")
          .order("occurred_at", { ascending: false })
          .limit(5)
          .then(({ data }) => data && setDebts(data as DebtRow[]))
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos", filter: `user_id=eq.${userId}` },
        () => supabase
          .from("todos")
          .select("id,title,status,due_at")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(7)
          .then(({ data }) => data && setTodos(data as TodoRow[]))
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const todayTotal = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startMs = start.getTime();

    let sum = 0;
    for (const e of expenses) {
      const ts = new Date(e.spent_at).getTime();
      if (ts >= startMs) sum += Number(e.amount);
    }
    return sum;
  }, [expenses]);

  return (
    <div className="grid gap-6">
      <div className="myaidiary-fade-up rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <p className="text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-400">
          TODAY
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Your life, organized.
        </h1>
        <p className="mt-3 text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Notes, spending, lena-dena, and tasks — synced in realtime.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <StatCard label="Recent notes" value={loading ? "…" : String(notes.length)} />
          <StatCard label="Spent today" value={loading ? "…" : `₹${todayTotal.toFixed(0)}`} />
          <StatCard label="Open debts" value={loading ? "…" : String(debts.length)} />
          <StatCard label="Pending tasks" value={loading ? "…" : String(todos.length)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel
          title="Notes"
          icon={<BookOpenText className="h-4 w-4" />}
          href="/notes"
        >
          {notes.length === 0 ? (
            <Empty>Write your first note.</Empty>
          ) : (
            <ul className="grid gap-2">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="rounded-2xl border border-zinc-200 bg-white/60 p-4 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <p className="font-semibold line-clamp-1">
                    {n.title?.trim() ? n.title : "Untitled"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {n.content?.trim() ? n.content.trim() : "Start writing…"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Expenses"
          icon={<Receipt className="h-4 w-4" />}
          href="/expenses"
        >
          {expenses.length === 0 ? (
            <Empty>Add your first expense.</Empty>
          ) : (
            <ul className="grid gap-2">
              {expenses.map((e) => (
                <li
                  key={e.id}
                  className="rounded-2xl border border-zinc-200 bg-white/60 p-4 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">₹{Number(e.amount).toFixed(0)}</p>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                      {e.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {e.description || "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Lena-Dena"
          icon={<HandCoins className="h-4 w-4" />}
          href="/debts"
        >
          {debts.length === 0 ? (
            <Empty>No open balances.</Empty>
          ) : (
            <ul className="grid gap-2">
              {debts.map((d) => (
                <li
                  key={d.id}
                  className="rounded-2xl border border-zinc-200 bg-white/60 p-4 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold line-clamp-1">{d.person}</p>
                    <p className="font-semibold">
                      ₹{Number(d.amount).toFixed(0)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {d.direction === "lent" ? "They owe you" : "You owe them"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="To-do"
          icon={<ListTodo className="h-4 w-4" />}
          href="/todos"
        >
          {todos.length === 0 ? (
            <Empty>Plan your day.</Empty>
          ) : (
            <ul className="grid gap-2">
              {todos.map((t) => (
                <li
                  key={t.id}
                  className="rounded-2xl border border-zinc-200 bg-white/60 p-4 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <p className="font-semibold line-clamp-1">{t.title}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/60 p-4 shadow-sm shadow-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/10">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Panel({
  title,
  icon,
  href,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="myaidiary-fade-up rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-zinc-200 bg-white/70 text-zinc-900 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none">
            {icon}
          </span>
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/60 px-3 py-1 text-xs font-semibold text-zinc-900 backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10"
        >
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
      {children}
    </div>
  );
}
