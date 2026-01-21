"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  Receipt,
  HandCoins,
  ListTodo,
  Sparkles,
  Brain,
  TrendingUp,
} from "lucide-react";
import { storage, initDemoData } from "@/app/lib/storage";

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
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [todos, setTodos] = useState<TodoRow[]>([]);

  useEffect(() => {
    // Initialize demo data
    initDemoData();
    refreshAll();
    setLoading(false);
  }, []);

  function refreshAll() {
    const allNotes = storage.get<any[]>('notes', []);
    const allExpenses = storage.get<any[]>('expenses', []);
    const allDebts = storage.get<any[]>('debts', []);
    const allTodos = storage.get<any[]>('todos', []);

    setNotes(allNotes.slice(0, 5) as NoteRow[]);
    setExpenses(allExpenses.slice(0, 5) as ExpenseRow[]);
    setDebts(allDebts.filter(d => d.status === 'open').slice(0, 5) as DebtRow[]);
    setTodos(allTodos.filter(t => t.status === 'open').slice(0, 7) as TodoRow[]);
  }

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
      {/* AI Intelligence Banner */}
      <div className="myaidiary-fade-up rounded-3xl border-2 border-gradient-to-r from-indigo-200 to-fuchsia-200 bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-indigo-50 p-6 shadow-xl shadow-indigo-500/20 dark:border-indigo-500/30 dark:from-indigo-950/30 dark:via-fuchsia-950/30 dark:to-indigo-950/30">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-purple-500 text-white shadow-lg">
            <Brain className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200">
                🚀 AI-Powered Personal Intelligence
              </h3>
              <span className="rounded-full bg-fuchsia-500 px-2 py-0.5 text-xs font-bold text-white">
                PREMIUM
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              <strong className="text-indigo-600 dark:text-indigo-400">Our AI analyzes your entire life:</strong> From journal entries to expenses, tasks to habits — get personalized insights, emotional patterns, productivity recommendations, and predictive analytics.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-indigo-200 bg-white/80 p-3 dark:border-indigo-500/30 dark:bg-white/10">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Sentiment Analysis</span>
                </div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Understands your emotions & mood trends
                </p>
              </div>
              <div className="rounded-xl border border-fuchsia-200 bg-white/80 p-3 dark:border-fuchsia-500/30 dark:bg-white/10">
                <div className="flex items-center gap-2 text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Pattern Recognition</span>
                </div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Identifies habits & recurring behaviors
                </p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-white/80 p-3 dark:border-purple-500/30 dark:bg-white/10">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
                  <Brain className="h-4 w-4" />
                  <span>Smart Recommendations</span>
                </div>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Personalized tips for better wellbeing
                </p>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-yellow-300 bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-800 dark:border-yellow-600/50 dark:bg-yellow-900/30 dark:text-yellow-200">
              ⚠️ Demo Mode: AI features available in premium version
            </div>
          </div>
        </div>
      </div>

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
          <StatCard label="Spent today" value={loading ? "…" : `$${todayTotal.toFixed(0)}`} />
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
                    <p className="font-semibold">${Number(e.amount).toFixed(0)}</p>
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
                      ${Number(d.amount).toFixed(0)}
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
