"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser";

type ExpenseRow = {
  id: string;
  user_id: string;
  amount: string | number;
  currency: string;
  category: string;
  description: string;
  spent_at: string;
  created_at: string;
};

function formatCompact(ts: string) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ExpensesClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<ExpenseRow[]>([]);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (ignore) return;
      const uid = data.user?.id ?? null;
      setUserId(uid);

      const { data: rows } = await supabase
        .from("expenses")
        .select("id,user_id,amount,currency,category,description,spent_at,created_at")
        .order("spent_at", { ascending: false });

      if (rows) setItems(rows as ExpenseRow[]);
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`expenses-realtime-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${userId}` },
        async () => {
          const { data: rows } = await supabase
            .from("expenses")
            .select("id,user_id,amount,currency,category,description,spent_at,created_at")
            .order("spent_at", { ascending: false });
          if (rows) setItems(rows as ExpenseRow[]);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  async function addExpense() {
    if (!userId) return;

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return;

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: userId,
        amount: amt,
        currency: "INR",
        category,
        description,
        spent_at: new Date().toISOString(),
      })
      .select("id,user_id,amount,currency,category,description,spent_at,created_at")
      .single();

    if (error || !data) return;

    setAmount("");
    setDescription("");
    setItems((prev) => [data as ExpenseRow, ...prev]);
  }

  async function removeExpense(id: string) {
    await supabase.from("expenses").delete().eq("id", id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  const totalToday = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startMs = start.getTime();

    let sum = 0;
    for (const e of items) {
      const ts = new Date(e.spent_at).getTime();
      if (ts >= startMs) sum += Number(e.amount);
    }
    return sum;
  }, [items]);

  return (
    <div className="grid gap-6">
      <div className="myaidiary-fade-up rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <p className="text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-400">
          EXPENSES
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Where did the money go?
        </h1>
        <p className="mt-3 text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Add spending in seconds. Totals update live.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white/60 p-4 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Spent today</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">₹{totalToday.toFixed(0)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white/60 p-4 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Entries</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{items.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <div className="myaidiary-fade-up rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <p className="text-sm font-semibold">Add expense</p>

            <div className="mt-3 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount (₹)"
                  inputMode="decimal"
                  className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-zinc-950 dark:border-white/10 dark:bg-black/30 dark:focus:border-white"
                />

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-zinc-950 dark:border-white/10 dark:bg-black/30 dark:focus:border-white"
                >
                  <option value="food">Food</option>
                  <option value="travel">Travel</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Bills</option>
                  <option value="health">Health</option>
                  <option value="general">General</option>
                </select>
              </div>

              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was it for? (optional)"
                className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-zinc-950 dark:border-white/10 dark:bg-black/30 dark:focus:border-white"
              />

              <button
                onClick={addExpense}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 text-sm font-semibold text-white shadow-md shadow-zinc-950/20 transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-800 dark:bg-white dark:text-black dark:shadow-white/20 dark:hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tip: keep categories simple for speed.
              </p>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="myaidiary-fade-up rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Recent</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {items.length} total
              </p>
            </div>

            <div className="mt-3 grid gap-2">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
                  No expenses yet.
                </div>
              ) : (
                items.map((e) => (
                  <div
                    key={e.id}
                    className="group rounded-2xl border border-zinc-200 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          ₹{Number(e.amount).toFixed(0)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {formatCompact(e.spent_at)} · {e.category}
                        </p>
                        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                          {e.description || "—"}
                        </p>
                      </div>

                      <button
                        onClick={() => removeExpense(e.id)}
                        title="Delete"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
