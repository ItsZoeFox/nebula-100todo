"use client";
import { useState } from "react";
import { useTodoStore } from "@/app/store/useTodoStore";
import CategoryManager from "./CategoryManager";

const STATUS_ICON: Record<string, string> = {
  done: "✓", in_progress: "◎", blocked: "✕", not_started: "·",
};

export default function ListView({ onAddGoal }: { onAddGoal: () => void }) {
  const todos = useTodoStore((s) => s.todos);
  const categories = useTodoStore((s) => s.categories);
  const setSelected = useTodoStore((s) => s.setSelected);
  const selectedId = useTodoStore((s) => s.selectedId);
  const getCatColor = useTodoStore((s) => s.getCatColor);
  const [query, setQuery] = useState("");
  const [showCatMgr, setShowCatMgr] = useState(false);

  const filtered = query.trim() ? todos.filter((t) => t.title.includes(query.trim())) : todos;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "'Press Start 2P', monospace" }}>
      {/* Search + buttons */}
      <div className="flex gap-2 p-4 pb-2 shrink-0">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索目标..."
          className="flex-1 px-3 py-2 text-[13px] outline-none"
          style={{ background: "#0a0a2a", border: "1px solid #2a2a6a", color: "#c8c8ff", fontFamily: "'Press Start 2P', monospace" }}
        />
        <button
          onClick={() => setShowCatMgr(true)}
          className="px-3 py-2 text-[12px] shrink-0 transition-opacity hover:opacity-80"
          style={{ border: "1px solid #2a2a6a", color: "#6a6aaa", fontFamily: "'Press Start 2P', monospace" }}
        >⚙</button>
        <button
          onClick={onAddGoal}
          className="px-4 py-2 text-[12px] shrink-0 transition-opacity hover:opacity-80"
          style={{ background: "#2a1a5a", border: "1px solid #6a3aaa", color: "#c084fc", fontFamily: "'Press Start 2P', monospace" }}
        >+ 目标</button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 md:pb-4">
        {query.trim() ? (
          <div className="flex flex-col gap-2 mt-2">
            {filtered.length === 0 && (
              <div className="text-[13px] mt-8 text-center" style={{ color: "#3a3a6a" }}>没有匹配的目标</div>
            )}
            {filtered.map((t) => (
              <TodoRow key={t.id} todo={t} selected={t.id === selectedId}
                color={getCatColor(t.cat)} onClick={() => setSelected(t.id === selectedId ? null : t.id)} />
            ))}
          </div>
        ) : (
          categories.map((cat) => {
            const catTodos = todos.filter((t) => t.cat === cat.name);
            if (!catTodos.length) return null;
            const avgProgress = catTodos.reduce((s, t) => s + t.progress, 0) / catTodos.length;
            return (
              <div key={cat.name} className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[14px]" style={{ color: cat.color }}>{cat.name}</span>
                  <div className="flex-1 h-[3px]" style={{ background: "#1a1a3a" }}>
                    <div className="h-full transition-all" style={{ width: `${avgProgress * 100}%`, background: cat.color }} />
                  </div>
                  <span className="text-[11px]" style={{ color: "#3a3a6a" }}>{Math.round(avgProgress * 100)}%</span>
                </div>
                <div className="flex flex-col gap-1">
                  {catTodos.map((t) => (
                    <TodoRow key={t.id} todo={t} selected={t.id === selectedId}
                      color={cat.color} onClick={() => setSelected(t.id === selectedId ? null : t.id)} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCatMgr && <CategoryManager onClose={() => setShowCatMgr(false)} />}
    </div>
  );
}

function TodoRow({ todo, selected, color, onClick }: {
  todo: { id: number; title: string; progress: number; status: string };
  selected: boolean; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
      style={{
        background: selected ? `${color}15` : "transparent",
        border: `1px solid ${selected ? color + "55" : "#1a1a3a"}`,
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      <span className="text-[14px] shrink-0" style={{ color: todo.status === "done" ? color : "#3a3a6a" }}>
        {STATUS_ICON[todo.status]}
      </span>
      <span className="text-[12px] leading-relaxed flex-1" style={{ color: selected ? "#e0e0ff" : "#9a9ac8" }}>
        #{todo.id} {todo.title}
      </span>
      <span className="text-[11px] shrink-0" style={{ color: "#3a3a6a" }}>{Math.round(todo.progress * 100)}%</span>
    </button>
  );
}
