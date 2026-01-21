"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { storage, initDemoData } from "@/app/lib/storage";

type ExpenseRow = {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  spent_at: string;
};

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Coffee", "Other"];

export default function ExpensesClientSimple() {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");

  useEffect(() => {
    initDemoData();
    loadExpenses();
  }, []);

  function loadExpenses() {
    const all = storage.get<ExpenseRow[]>('expenses', []);
    setExpenses(all.sort((a, b) => 
      new Date(b.spent_at).getTime() - new Date(a.spent_at).getTime()
    ));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const all = storage.get<ExpenseRow[]>('expenses', []);
    const newExpense: ExpenseRow = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      currency: 'USD',
      category,
      description,
      spent_at: new Date().toISOString(),
    };

    storage.set('expenses', [newExpense, ...all]);
    setAmount("");
    setDescription("");
    loadExpenses();
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return;
    const all = storage.get<ExpenseRow[]>('expenses', []);
    storage.set('expenses', all.filter(e => e.id !== id));
    loadExpenses();
  }

  const totalToday = expenses.filter(e => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(e.spent_at).getTime() >= today.getTime();
  }).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-400">
          TODAY
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">${totalToday.toFixed(2)}</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-semibold mb-4">Add Expense</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-indigo-300 dark:border-white/10 dark:bg-black/30 dark:focus:border-indigo-500"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-indigo-300 dark:border-white/10 dark:bg-black/30 dark:focus:border-indigo-500 sm:col-span-2"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:col-span-2"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-semibold mb-4">Recent Expenses</p>
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-semibold">${expense.amount.toFixed(2)}</p>
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                    {expense.category}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {expense.description || "—"}
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {new Date(expense.spent_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(expense.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
