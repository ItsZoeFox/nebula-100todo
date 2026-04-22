"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  TODOS, DEFAULT_CATEGORIES, TODO_CAT_MIGRATION,
  Category, Status, TabId, TodoRecord, LogEntry, CategoryDef, MonthlyFocus, SubTask,
} from "@/app/data/todos";

let _nextTodoId = 1000;
function genId() { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }
function nowStr() {
  return new Date().toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function statusFromProgress(p: number): Status {
  return p >= 1 ? "done" : p > 0 ? "in_progress" : "not_started";
}
const today = () => new Date().toDateString();

function pickDailyId(todos: TodoRecord[], exclude?: number): number {
  const incomplete = todos.filter((t) => t.status !== "done" && t.id !== exclude);
  if (!incomplete.length) return todos[0]?.id ?? 1;
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return incomplete[day % incomplete.length].id;
}

interface Store {
  todos: TodoRecord[];
  logs: LogEntry[];
  categories: CategoryDef[];
  monthlyFocus: MonthlyFocus | null;
  dailyId: number;
  dailyDate: string;
  selectedId: number | null;
  activeTab: TabId;

  initStore: () => void;
  setActiveTab: (tab: TabId) => void;
  setSelected: (id: number | null) => void;
  swapDaily: () => void;

  // Todo CRUD
  addTodo: (title: string, cat: Category, progress: number) => void;
  editTodo: (id: number, updates: Partial<Pick<TodoRecord, "title" | "cat" | "progress" | "status">>) => void;
  deleteTodo: (id: number) => void;
  setStatus: (id: number, status: Status) => void;
  setProgress: (id: number, progress: number) => void;

  // SubTask CRUD
  addSubTask: (todoId: number, text: string) => void;
  toggleSubTask: (todoId: number, subTaskId: string) => void;
  deleteSubTask: (todoId: number, subTaskId: string) => void;

  // Log CRUD
  addLog: (text: string, images: string[], todoId?: number) => void;
  editLog: (logId: string, text: string) => void;
  deleteLog: (logId: string) => void;

  // Category CRUD
  addCategory: (name: string, color: string) => void;
  editCategory: (oldName: string, newName: string, color: string) => void;
  deleteCategory: (name: string) => void;

  // Monthly focus
  setMonthlyFocus: (focus: MonthlyFocus | null) => void;

  // Cloud sync
  syncFromCloud: () => Promise<void>;
  syncToCloud: () => Promise<void>;

  // Helper selector
  getCatColor: (cat: string) => string;
}

function seedTodos(): TodoRecord[] {
  return TODOS.map((t) => ({
    id: t.id, title: t.title, cat: t.cat,
    progress: t.initProgress, status: statusFromProgress(t.initProgress),
  }));
}

function seedLogs(): LogEntry[] {
  return TODOS.filter((t) => t.initNote).map((t) => ({
    id: genId(), text: t.initNote!, date: "初始备注", ts: 0, images: [], todoId: t.id,
  }));
}

// Migrate old format where logs lived inside todo state objects
function migrateOldFormat(raw: Record<string, unknown>): { todos: TodoRecord[]; logs: LogEntry[] } | null {
  const oldTodos = raw.todos as Array<{ id: number; progress: number; status: Status; logs?: Array<{ text: string; date: string }> }>;
  if (!oldTodos?.[0] || !("logs" in oldTodos[0])) return null;
  const seedMap = new Map(TODOS.map((t) => [t.id, t]));
  const todos: TodoRecord[] = oldTodos.map((ot) => {
    const seed = seedMap.get(ot.id);
    // Apply per-todo category migration if old category was "成长"
    let cat = seed?.cat ?? "未分类";
    if (!DEFAULT_CATEGORIES.find((c) => c.name === cat)) {
      cat = TODO_CAT_MIGRATION[ot.id] ?? seed?.cat ?? "未分类";
    }
    return { id: ot.id, title: seed?.title ?? `目标 #${ot.id}`, cat, progress: ot.progress, status: ot.status };
  });
  const logs: LogEntry[] = [];
  oldTodos.forEach((ot) => {
    (ot.logs ?? []).forEach((l) => {
      logs.push({ id: genId(), text: l.text, date: l.date, ts: 0, images: [], todoId: ot.id });
    });
  });
  return { todos, logs };
}

export const useTodoStore = create<Store>()(
  persist(
    (set, get) => ({
      todos: [],
      logs: [],
      categories: [],
      monthlyFocus: null,
      dailyId: 1,
      dailyDate: "",
      selectedId: null,
      activeTab: "galaxy",

      initStore: () => {
        const { todos, categories, dailyDate, dailyId } = get();

        // First launch
        if (todos.length === 0) {
          const initial = seedTodos();
          set({
            todos: initial,
            logs: seedLogs(),
            categories: DEFAULT_CATEGORIES,
            dailyId: pickDailyId(initial),
            dailyDate: today(),
          });
          return;
        }

        // Ensure categories exist (migration from older version)
        if (categories.length === 0) {
          set({ categories: DEFAULT_CATEGORIES });
        }

        // Ensure "未分类" always exists
        if (!get().categories.find((c) => c.name === "未分类")) {
          set((s) => ({ categories: [...s.categories, { name: "未分类", color: "#4a4a6a" }] }));
        }

        // Merge any new seed todos not yet in store
        const existing = new Set(todos.map((t) => t.id));
        const newSeeds = TODOS.filter((t) => !existing.has(t.id)).map((t) => ({
          id: t.id, title: t.title, cat: t.cat,
          progress: t.initProgress, status: statusFromProgress(t.initProgress),
        }));
        if (newSeeds.length > 0) set((s) => ({ todos: [...s.todos, ...newSeeds] }));

        // Migrate any todos that still have old/missing categories
        const catNames = new Set(get().categories.map((c) => c.name));
        const needsMigration = get().todos.filter((t) => !catNames.has(t.cat));
        if (needsMigration.length > 0) {
          set((s) => ({
            todos: s.todos.map((t) => {
              if (catNames.has(t.cat)) return t;
              const newCat = TODO_CAT_MIGRATION[t.id] ?? TODOS.find((s) => s.id === t.id)?.cat ?? "未分类";
              return { ...t, cat: catNames.has(newCat) ? newCat : "未分类" };
            }),
          }));
        }

        // Refresh daily if date changed
        if (dailyDate !== today()) {
          set({ dailyId: pickDailyId(get().todos, dailyId), dailyDate: today() });
        }
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelected: (id) => set({ selectedId: id }),
      swapDaily: () => {
        const { todos, dailyId } = get();
        set({ dailyId: pickDailyId(todos, dailyId), dailyDate: today() });
      },

      addTodo: (title, cat, progress) => {
        const id = _nextTodoId++;
        set((s) => ({ todos: [...s.todos, { id, title, cat, progress, status: statusFromProgress(progress) }] }));
      },

      editTodo: (id, updates) =>
        set((s) => ({
          todos: s.todos.map((t) => {
            if (t.id !== id) return t;
            const merged = { ...t, ...updates };
            // Subtasks override manual progress when they exist
            if (merged.subTasks && merged.subTasks.length > 0) {
              merged.progress = merged.subTasks.filter((st: SubTask) => st.done).length / merged.subTasks.length;
            } else if (updates.progress !== undefined) {
              merged.status = statusFromProgress(updates.progress);
            }
            if (updates.status === "done") merged.progress = 1;
            if (updates.status === "not_started") merged.progress = 0;
            merged.status = statusFromProgress(merged.progress);
            return merged;
          }),
        })),

      deleteTodo: (id) =>
        set((s) => ({
          todos: s.todos.filter((t) => t.id !== id),
          logs: s.logs.map((l) => l.todoId === id ? { ...l, todoId: undefined } : l),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      setStatus: (id, status) => get().editTodo(id, { status }),
      setProgress: (id, progress) => {
        const todo = get().todos.find((t) => t.id === id);
        if (todo?.subTasks && todo.subTasks.length > 0) return; // subTasks control progress
        get().editTodo(id, { progress });
      },

      addSubTask: (todoId, text) => {
        if (!text.trim()) return;
        const newSub: SubTask = { id: genId(), text: text.trim(), done: false };
        set((s) => {
          const todos = s.todos.map((t) => {
            if (t.id !== todoId) return t;
            const subTasks = [...(t.subTasks ?? []), newSub];
            const progress = subTasks.filter((st) => st.done).length / subTasks.length;
            return { ...t, subTasks, progress, status: statusFromProgress(progress) };
          });
          return { todos };
        });
      },

      toggleSubTask: (todoId, subTaskId) => {
        set((s) => {
          const todos = s.todos.map((t) => {
            if (t.id !== todoId) return t;
            const subTasks = (t.subTasks ?? []).map((st) =>
              st.id === subTaskId ? { ...st, done: !st.done } : st
            );
            const progress = subTasks.length > 0 ? subTasks.filter((st) => st.done).length / subTasks.length : t.progress;
            return { ...t, subTasks, progress, status: statusFromProgress(progress) };
          });
          return { todos };
        });
      },

      deleteSubTask: (todoId, subTaskId) => {
        set((s) => {
          const todos = s.todos.map((t) => {
            if (t.id !== todoId) return t;
            const subTasks = (t.subTasks ?? []).filter((st) => st.id !== subTaskId);
            const progress = subTasks.length > 0 ? subTasks.filter((st) => st.done).length / subTasks.length : t.progress;
            return { ...t, subTasks, progress, status: statusFromProgress(progress) };
          });
          return { todos };
        });
      },

      addLog: (text, images, todoId) => {
        const entry: LogEntry = { id: genId(), text, date: nowStr(), ts: Date.now(), images, todoId };
        set((s) => ({ logs: [entry, ...s.logs] }));
      },
      editLog: (logId, text) =>
        set((s) => ({ logs: s.logs.map((l) => l.id === logId ? { ...l, text } : l) })),
      deleteLog: (logId) => set((s) => ({ logs: s.logs.filter((l) => l.id !== logId) })),

      // ── Category CRUD ──────────────────────────────────────
      addCategory: (name, color) => {
        if (!name.trim()) return;
        if (get().categories.find((c) => c.name === name)) return;
        set((s) => ({ categories: [...s.categories, { name: name.trim(), color }] }));
      },

      editCategory: (oldName, newName, color) => {
        if (!newName.trim() || oldName === "未分类") return;
        set((s) => ({
          categories: s.categories.map((c) =>
            c.name === oldName ? { name: newName.trim(), color } : c
          ),
          todos: s.todos.map((t) =>
            t.cat === oldName ? { ...t, cat: newName.trim() } : t
          ),
        }));
      },

      deleteCategory: (name) => {
        if (name === "未分类") return;
        set((s) => ({
          categories: s.categories.filter((c) => c.name !== name),
          todos: s.todos.map((t) => t.cat === name ? { ...t, cat: "未分类" } : t),
        }));
      },

      setMonthlyFocus: (focus) => set({ monthlyFocus: focus }),

      syncFromCloud: async () => {
        try {
          const res = await fetch("/api/state");
          if (!res.ok) return;
          const data = await res.json();
          if (!data) return;
          // Cloud is the source of truth — overwrite local state
          set({
            todos: data.todos ?? get().todos,
            logs: data.logs ?? get().logs,
            categories: data.categories ?? get().categories,
            monthlyFocus: data.monthlyFocus ?? null,
            dailyId: data.dailyId ?? get().dailyId,
            dailyDate: data.dailyDate ?? get().dailyDate,
          });
        } catch { /* offline — keep local state */ }
      },

      syncToCloud: async () => {
        const { todos, logs, categories, monthlyFocus, dailyId, dailyDate } = get();
        try {
          await fetch("/api/state", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ todos, logs, categories, monthlyFocus, dailyId, dailyDate }),
          });
        } catch { /* offline — will retry on next change */ }
      },

      getCatColor: (cat) => {
        const found = get().categories.find((c) => c.name === cat);
        return found?.color ?? "#4a4a6a";
      },
    }),
    {
      name: "nebula-100todo-v2",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        try {
          const old = localStorage.getItem("nebula-100todo");
          if (old && state.todos.length === 0) {
            const parsed = JSON.parse(old) as Record<string, unknown>;
            const migrated = migrateOldFormat(parsed);
            if (migrated) {
              state.todos = migrated.todos;
              state.logs = migrated.logs;
              state.categories = DEFAULT_CATEGORIES;
              state.dailyId = pickDailyId(migrated.todos);
              state.dailyDate = today();
            }
          }
        } catch { /* ignore */ }
      },
    }
  )
);
