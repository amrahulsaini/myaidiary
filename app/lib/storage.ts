// Session storage utilities for demo mode
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  },
};

// Demo data
export const DEMO_NOTES = [
  {
    id: '1',
    title: 'My AI Journey Begins',
    content: 'Started exploring AI tools today. Excited to see how MyAIDiary can help me track my thoughts and patterns. The voice-to-text feature sounds amazing!',
    theme: 'default',
    font: 'sans',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Productivity Tips',
    content: 'Key learnings from today:\n- Morning routines matter\n- Deep work blocks increase focus\n- Regular breaks boost creativity\n- AI tools save tons of time',
    theme: 'calm',
    font: 'sans',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Weekend Plans',
    content: 'This weekend I want to:\n1. Try the new AI features\n2. Organize my expenses\n3. Complete my todo list\n4. Reflect on this week',
    theme: 'sunset',
    font: 'sans',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEMO_EXPENSES = [
  {
    id: '1',
    amount: 45,
    currency: 'USD',
    category: 'Food',
    description: 'Lunch with team',
    spent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    amount: 120,
    currency: 'USD',
    category: 'Transport',
    description: 'Uber rides this week',
    spent_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    amount: 15,
    currency: 'USD',
    category: 'Coffee',
    description: 'Morning coffee',
    spent_at: new Date().toISOString(),
  },
  {
    id: '4',
    amount: 89,
    currency: 'USD',
    category: 'Shopping',
    description: 'New headphones',
    spent_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEMO_DEBTS = [
  {
    id: '1',
    person: 'Alex',
    direction: 'lent' as const,
    amount: 50,
    currency: 'USD',
    status: 'open' as const,
    occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    person: 'Sarah',
    direction: 'borrowed' as const,
    amount: 30,
    currency: 'USD',
    status: 'open' as const,
    occurred_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEMO_TODOS = [
  {
    id: '1',
    title: 'Try MyAIDiary voice features',
    status: 'open' as const,
    due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Review weekly expenses',
    status: 'open' as const,
    due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Write reflection journal',
    status: 'open' as const,
    due_at: null,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

// Initialize demo data if not exists
export function initDemoData() {
  if (!storage.get('notes', []).length) {
    storage.set('notes', DEMO_NOTES);
  }
  if (!storage.get('expenses', []).length) {
    storage.set('expenses', DEMO_EXPENSES);
  }
  if (!storage.get('debts', []).length) {
    storage.set('debts', DEMO_DEBTS);
  }
  if (!storage.get('todos', []).length) {
    storage.set('todos', DEMO_TODOS);
  }
}
