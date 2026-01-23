"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Trash2, Brain, Lock, Loader2, Sparkles } from "lucide-react";
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
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  async function handleAiAnalysis() {
    if (expenses.length === 0) {
      alert("Add some expenses first!");
      return;
    }

    setIsAnalyzing(true);
    setAiInsights(null);

    try {
      const response = await fetch("/api/ai/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenses: expenses.slice(0, 10) }), // Last 10 expenses
      });

      if (!response.ok) {
        throw new Error("AI analysis failed");
      }

      const data = await response.json();
      setAiInsights(data.analysis);
    } catch (error) {
      console.error("AI analysis error:", error);
      alert("Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const totalToday = expenses.filter(e => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(e.spent_at).getTime() >= today.getTime();
  }).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="grid gap-6">
      {/* AI Spending Insights Banner */}
      <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-5 shadow-lg dark:border-emerald-500/30 dark:from-emerald-950/30 dark:to-green-950/30">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white">
            <Brain className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              💡 AI Spending Analysis - Powered by Google Gemini
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Get personalized insights on your spending patterns and savings opportunities
            </p>
          </div>
          <button
            onClick={handleAiAnalysis}
            disabled={isAnalyzing || expenses.length === 0}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Ask AI
                <span className="inline-flex items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                  NEW
                </span>
              </>
            )}
          </button>
        </div>
        
        {/* AI Analysis Result */}
        {aiInsights && (
          <div className="mt-4 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5 dark:border-green-500/30 dark:from-green-950/30 dark:to-emerald-950/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="font-bold text-green-900 dark:text-green-200">AI Financial Analysis</h4>
              </div>
              <button
                onClick={() => setAiInsights(null)}
                className="text-xs text-green-600 hover:text-green-700 dark:text-green-400"
              >
                Close
              </button>
            </div>
            <div className="prose prose-sm max-w-none text-zinc-700 dark:text-zinc-300">
              {aiInsights.split('\n').map((line, idx) => {
                if (line.trim().startsWith('📊') || line.trim().startsWith('💡') || line.trim().startsWith('🎯')) {
                  return (
                    <h5 key={idx} className="font-bold text-base text-green-900 dark:text-green-200 mt-4 mb-2 first:mt-0">
                      {line.trim()}
                    </h5>
                  );
                } else if (line.trim().startsWith('•')) {
                  return (
                    <p key={idx} className="text-sm leading-6 ml-1 mb-1.5">
                      {line.trim()}
                    </p>
                  );
                } else if (line.trim()) {
                  return <p key={idx} className="text-sm leading-6 mb-2">{line.trim()}</p>;
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>

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
