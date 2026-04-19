"use client";
import { useState, useEffect } from "react";
import { useTodoStore } from "@/app/store/useTodoStore";
import type { TodoRecord } from "@/app/data/todos";

interface Props {
  mode: "add" | "edit";
  todo?: TodoRecord;
  onClose: () => void;
}

export default function GoalFormModal({ mode, todo, onClose }: Props) {
  const categories = useTodoStore((s) => s.categories);
  const getCatColor = useTodoStore((s) => s.getCatColor);
  const addTodo = useTodoStore((s) => s.addTodo);
  const editTodo = useTodoStore((s) => s.editTodo);

  const [title, setTitle] = useState(todo?.title ?? "");
  const [cat, setCat] = useState(todo?.cat ?? categories[0]?.name ?? "未分类");
  const [progress, setProgress] = useState(Math.round((todo?.progress ?? 0) * 100));

  useEffect(() => {
    if (todo) { setTitle(todo.title); setCat(todo.cat); setProgress(Math.round(todo.progress * 100)); }
  }, [todo]);

  function handleSave() {
    if (!title.trim()) return;
    if (mode === "add") addTodo(title.trim(), cat, progress / 100);
    else if (todo) editTodo(todo.id, { title: title.trim(), cat, progress: progress / 100 });
    onClose();
  }

  const color = getCatColor(cat);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,10,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full flex flex-col gap-4 p-5" style={{ maxWidth: 460, background: "#06061e", border: `1px solid ${color}44`, fontFamily: "'Press Start 2P', monospace" }}>
        <div className="flex items-center justify-between">
          <span className="text-[14px]" style={{ color: "#6a6aaa" }}>{mode === "add" ? "+ 新增目标" : "✎ 编辑目标"}</span>
          <button onClick={onClose} className="text-[14px]" style={{ color: "#4a4a8a" }}>[×]</button>
        </div>

        <div>
          <div className="text-[11px] mb-2" style={{ color: "#4a4a8a" }}>目标名称</div>
          <textarea value={title} onChange={(e) => setTitle(e.target.value)} placeholder="写下这个目标..." rows={3} autoFocus
            className="w-full px-3 py-2 text-[13px] resize-none outline-none leading-relaxed"
            style={{ background: "#0a0a2a", border: "1px solid #2a2a6a", color: "#c8c8ff", fontFamily: "'Press Start 2P', monospace" }} />
        </div>

        <div>
          <div className="text-[11px] mb-2" style={{ color: "#4a4a8a" }}>分类</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c.name} onClick={() => setCat(c.name)}
                className="text-[11px] px-2 py-1 transition-colors"
                style={{ border: `1px solid ${cat === c.name ? c.color : "#2a2a6a"}`, color: cat === c.name ? c.color : "#4a4a8a", background: cat === c.name ? `${c.color}15` : "transparent" }}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] mb-2" style={{ color: "#4a4a8a" }}>初始进度 · {progress}%</div>
          <div className="h-2 w-full mb-2" style={{ background: "#1a1a3a" }}>
            <div className="h-full transition-all" style={{ width: `${progress}%`, background: color }} />
          </div>
          <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full accent-violet-400" />
        </div>

        <button onClick={handleSave} disabled={!title.trim()}
          className="w-full py-3 text-[13px] transition-opacity hover:opacity-80 disabled:opacity-30"
          style={{ background: `${color}22`, border: `1px solid ${color}66`, color, fontFamily: "'Press Start 2P', monospace" }}>
          [ {mode === "add" ? "创建目标" : "保存修改"} ]
        </button>
      </div>
    </div>
  );
}
