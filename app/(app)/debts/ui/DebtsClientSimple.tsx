"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { storage, initDemoData } from "@/app/lib/storage";

type DebtRow = {
  id: string;
  person: string;
  direction: "lent" | "borrowed";
  amount: number;
  currency: string;
  status: "open" | "settled";
  occurred_at: string;
};

export default function DebtsClientSimple() {
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"lent" | "borrowed">("lent");

  useEffect(() => {
    initDemoData();
    loadDebts();
  }, []);

  function loadDebts() {
    const all = storage.get<DebtRow[]>('debts', []);
    setDebts(all.sort((a, b) => 
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    ));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!person.trim() || !amount || parseFloat(amount) <= 0) return;

    const all = storage.get<DebtRow[]>('debts', []);
    const newDebt: DebtRow = {
      id: Date.now().toString(),
      person: person.trim(),
      direction,
      amount: parseFloat(amount),
      currency: 'USD',
      status: 'open',
      occurred_at: new Date().toISOString(),
    };

    storage.set('debts', [newDebt, ...all]);
    setPerson("");
    setAmount("");
    loadDebts();
  }

  function handleSettle(id: string) {
    const all = storage.get<DebtRow[]>('debts', []);
    storage.set('debts', all.map(d => 
      d.id === id ? { ...d, status: 'settled' as const } : d
    ));
    loadDebts();
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return;
    const all = storage.get<DebtRow[]>('debts', []);
    storage.set('debts', all.filter(d => d.id !== id));
    loadDebts();
  }

  const open = debts.filter(d => d.status === 'open');
  const settled = debts.filter(d => d.status === 'settled');
  
  const toReceive = open.filter(d => d.direction === 'lent').reduce((sum, d) => sum + d.amount, 0);
  const toPay = open.filter(d => d.direction === 'borrowed').reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-400">TO RECEIVE</p>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">${toReceive.toFixed(0)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-400">TO PAY</p>
          <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">${toPay.toFixed(0)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-400">NET</p>
          <p className={`mt-1 text-2xl font-semibold ${(toReceive - toPay) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${(toReceive - toPay).toFixed(0)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-semibold mb-4">Add Entry</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            placeholder="Person name"
            required
            className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-indigo-300 dark:border-white/10 dark:bg-black/30 dark:focus:border-indigo-500"
          />
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount ($)"
            required
            className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-indigo-300 dark:border-white/10 dark:bg-black/30 dark:focus:border-indigo-500"
          />
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "lent" | "borrowed")}
            className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-indigo-300 dark:border-white/10 dark:bg-black/30 dark:focus:border-indigo-500"
          >
            <option value="lent">They owe me</option>
            <option value="borrowed">I owe them</option>
          </select>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </form>

      {open.length > 0 && (
        <div className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold mb-4">Open ({open.length})</p>
          <div className="space-y-2">
            {open.map((debt) => (
              <div
                key={debt.id}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex-1">
                  <p className="font-semibold">{debt.person}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {debt.direction === 'lent' ? 'They owe you' : 'You owe them'}
                  </p>
                  <p className="mt-1 text-lg font-semibold">${debt.amount.toFixed(0)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSettle(debt.id)}
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-green-50 px-3 text-xs font-semibold text-green-600 transition hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Settle
                  </button>
                  <button
                    onClick={() => handleDelete(debt.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {settled.length > 0 && (
        <div className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold mb-4">Settled ({settled.length})</p>
          <div className="space-y-2">
            {settled.map((debt) => (
              <div
                key={debt.id}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4 opacity-60 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex-1">
                  <p className="font-semibold">{debt.person}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">${debt.amount.toFixed(0)}</p>
                </div>
                <button
                  onClick={() => handleDelete(debt.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
