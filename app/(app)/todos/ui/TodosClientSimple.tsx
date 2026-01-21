"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Trash2, CheckCircle2, Circle, X } from "lucide-react";
import { storage, initDemoData } from "@/app/lib/storage";

type TodoRow = {
  id: string;
  title: string;
  status: "open" | "done" | "canceled";
  due_at: string | null;
  created_at: string;
};

export default function TodosClientSimple() {
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    initDemoData();
    loadTodos();
  }, []);

  function loadTodos() {
    const all = storage.get<TodoRow[]>('todos', []);
    setTodos(all.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const all = storage.get<TodoRow[]>('todos', []);
    const newTodo: TodoRow = {
      id: Date.now().toString(),
      title: title.trim(),
      status: 'open',
      due_at: null,
      created_at: new Date().toISOString(),
    };

    storage.set('todos', [newTodo, ...all]);
    setTitle("");
    loadTodos();
  }

  function handleToggle(id: string) {
    const all = storage.get<TodoRow[]>('todos', []);
    storage.set('todos', all.map(t => 
      t.id === id ? { ...t, status: t.status === 'open' ? 'done' as const : 'open' as const } : t
    ));
    loadTodos();
  }

  function handleDelete(id: string) {
    const all = storage.get<TodoRow[]>('todos', []);
    storage.set('todos', all.filter(t => t.id !== id));
    loadTodos();
  }

  const open = todos.filter(t => t.status === 'open');
  const done = todos.filter(t => t.status === 'done');

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-400">OPEN TASKS</p>
          <p className="mt-1 text-2xl font-semibold">{open.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-400">COMPLETED</p>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">{done.length}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-semibold mb-4">Add Task</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to do?"
            required
            className="flex-1 h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-indigo-300 dark:border-white/10 dark:bg-black/30 dark:focus:border-indigo-500"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </form>

      {open.length > 0 && (
        <div className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold mb-4">Open Tasks ({open.length})</p>
          <div className="space-y-2">
            {open.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <button
                  onClick={() => handleToggle(todo.id)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-300 text-transparent transition hover:border-indigo-500 hover:text-indigo-500 dark:border-zinc-600"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>
                <p className="flex-1 text-sm font-medium">{todo.title}</p>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold mb-4">Completed ({done.length})</p>
          <div className="space-y-2">
            {done.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-green-50 p-4 dark:border-white/10 dark:bg-green-950/20"
              >
                <button
                  onClick={() => handleToggle(todo.id)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-green-500 text-green-600 transition hover:border-green-600 dark:text-green-400"
                >
                  <CheckCircle2 className="h-5 w-5 fill-current" />
                </button>
                <p className="flex-1 text-sm font-medium text-zinc-600 line-through dark:text-zinc-400">{todo.title}</p>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-400"
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
