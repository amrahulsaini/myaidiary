"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser";

type DebtRow = {
  id: string;
  user_id: string;
  person: string;
  direction: "lent" | "borrowed";
  amount: string | number;
  currency: string;
  note: string;
  status: "open" | "settled";
  occurred_at: string;
  settled_at: string | null;
};

function formatCompact(ts: string) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function DebtsClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<DebtRow[]>([]);

  const [person, setPerson] = useState("");
  const [direction, setDirection] = useState<DebtRow["direction"]>("lent");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      // Demo mode - skip user check
      if (ignore) return;
      const uid = "demo-user-id";
      setUserId(uid);

      const { data: rows } = await supabase
        .from("debts")
        .select(
          "id,user_id,person,direction,amount,currency,note,status,occurred_at,settled_at"
        )
        .order("occurred_at", { ascending: false });

      if (rows) setItems(rows as DebtRow[]);
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`debts-realtime-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "debts", filter: `user_id=eq.${userId}` },
        async () => {
          const { data: rows } = await supabase
            .from("debts")
            .select(
              "id,user_id,person,direction,amount,currency,note,status,occurred_at,settled_at"
            )
            .order("occurred_at", { ascending: false });
          if (rows) setItems(rows as DebtRow[]);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  async function addDebt() {
    if (!userId) return;

    const amt = Number(amount);
    if (!person.trim()) return;
    if (!Number.isFinite(amt) || amt <= 0) return;

    const { data, error } = await supabase
      .from("debts")
      .insert({
        user_id: userId,
        person: person.trim(),
        direction,
        amount: amt,
        currency: "INR",
        note,
        status: "open",
        occurred_at: new Date().toISOString(),
      })
      .select(
        "id,user_id,person,direction,amount,currency,note,status,occurred_at,settled_at"
      )
      .single();

    if (error || !data) return;

    setPerson("");
    setAmount("");
    setNote("");
    setItems((prev) => [data as DebtRow, ...prev]);
  }

  async function settle(id: string) {
    await supabase
      .from("debts")
      .update({ status: "settled", settled_at: new Date().toISOString() })
      .eq("id", id);
    setItems((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: "settled", settled_at: new Date().toISOString() }
          : d
      )
    );
  }

  async function removeDebt(id: string) {
    await supabase.from("debts").delete().eq("id", id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  const open = items.filter((d) => d.status === "open");

  const totals = useMemo(() => {
    let toReceive = 0;
    let toPay = 0;

    for (const d of open) {
      const amt = Number(d.amount);
      if (d.direction === "lent") toReceive += amt;
      else toPay += amt;
    }

    return { toReceive, toPay, net: toReceive - toPay };
  }, [open]);

  return (
    <div className="grid gap-6">
      <div className="myaidiary-fade-up rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <p className="text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-400">
          LENA-DENA
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Keep money simple.
        </h1>
        <p className="mt-3 text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Track balances and settle without drama.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="To receive" value={`₹${totals.toReceive.toFixed(0)}`} />
          <Stat label="To pay" value={`₹${totals.toPay.toFixed(0)}`} />
          <Stat label="Net" value={`₹${totals.net.toFixed(0)}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <div className="myaidiary-fade-up rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <p className="text-sm font-semibold">Add entry</p>

            <div className="mt-3 grid gap-3">
              <input
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="Person name (e.g., Rahul)"
                className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-zinc-950 dark:border-white/10 dark:bg-black/30 dark:focus:border-white"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as DebtRow["direction"])}
                  className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-zinc-950 dark:border-white/10 dark:bg-black/30 dark:focus:border-white"
                >
                  <option value="lent">I gave (they owe me)</option>
                  <option value="borrowed">I took (I owe them)</option>
                </select>

                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount (₹)"
                  inputMode="decimal"
                  className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-zinc-950 dark:border-white/10 dark:bg-black/30 dark:focus:border-white"
                />
              </div>

              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-zinc-950 dark:border-white/10 dark:bg-black/30 dark:focus:border-white"
              />

              <button
                onClick={addDebt}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 text-sm font-semibold text-white shadow-md shadow-zinc-950/20 transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-800 dark:bg-white dark:text-black dark:shadow-white/20 dark:hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="myaidiary-fade-up rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Open balances</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {open.length} open
              </p>
            </div>

            <div className="mt-3 grid gap-2">
              {open.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
                  No open balances.
                </div>
              ) : (
                open.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-2xl border border-zinc-200 bg-white/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold line-clamp-1">{d.person}</p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {formatCompact(d.occurred_at)} · {d.direction === "lent" ? "They owe you" : "You owe them"}
                        </p>
                        <p className="mt-2 text-sm font-semibold">₹{Number(d.amount).toFixed(0)}</p>
                        {d.note ? (
                          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                            {d.note}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => settle(d.id)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 text-xs font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-500 dark:bg-emerald-500/80 dark:hover:bg-emerald-500"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Settle
                        </button>
                        <button
                          onClick={() => removeDebt(d.id)}
                          title="Delete"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/60 p-4 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
