"use client";
import { useState } from "react";
import { useTodoStore } from "@/app/store/useTodoStore";

function InlineLogEdit({ logId, text, onDone }: { logId: string; text: string; onDone: () => void }) {
  const editLog = useTodoStore((s) => s.editLog);
  const [val, setVal] = useState(text);
  function save() { editLog(logId, val); onDone(); }
  return (
    <div className="flex flex-col gap-1 mb-2">
      <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={3} autoFocus
        className="w-full p-2 text-[13px] resize-none outline-none leading-relaxed"
        style={{ background: "#0a0a2a", border: "1px solid #4a4a8a", color: "#c8c8ff", fontFamily: "'Press Start 2P', monospace" }} />
      <div className="flex gap-2">
        <button onClick={save} className="text-[10px] px-2 py-1 transition-opacity hover:opacity-80"
          style={{ border: "1px solid #6a3aaa", color: "#c084fc" }}>保存</button>
        <button onClick={onDone} className="text-[10px] px-2 py-1 transition-opacity hover:opacity-80"
          style={{ border: "1px solid #2a2a6a", color: "#4a4a8a" }}>取消</button>
      </div>
    </div>
  );
}

export default function LogsView() {
  const logs = useTodoStore((s) => s.logs);
  const todos = useTodoStore((s) => s.todos);
  const setSelected = useTodoStore((s) => s.setSelected);
  const setActiveTab = useTodoStore((s) => s.setActiveTab);
  const deleteLog = useTodoStore((s) => s.deleteLog);
  const getCatColor = useTodoStore((s) => s.getCatColor);
  const [query, setQuery] = useState("");
  const [expandedImg, setExpandedImg] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const filtered = query.trim() ? logs.filter((l) => l.text.includes(query.trim())) : logs;
  const sorted = [...filtered].sort((a, b) => b.ts - a.ts);

  function openTodo(todoId: number) {
    setSelected(todoId);
    setActiveTab("list");
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "'Press Start 2P', monospace" }}>
      <div className="p-4 pb-2 shrink-0">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索记录..."
          className="w-full px-3 py-2 text-[13px] outline-none"
          style={{ background: "#0a0a2a", border: "1px solid #2a2a6a", color: "#c8c8ff", fontFamily: "'Press Start 2P', monospace" }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 md:pb-4">
        {!sorted.length && (
          <div className="text-[13px] mt-12 text-center" style={{ color: "#3a3a6a" }}>还没有记录</div>
        )}
        {sorted.map((log) => {
          const linked = log.todoId ? todos.find((t) => t.id === log.todoId) : null;
          const color = linked ? getCatColor(linked.cat) : "#4a4a8a";
          return (
            <div key={log.id} className="mb-4 p-3 group" style={{ border: "1px solid #1a1a3a", background: "#06061a" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px]" style={{ color: "#3a3a6a" }}>{log.date}</span>
                <div className="flex gap-3">
                  <button onClick={() => setEditingLogId(log.id === editingLogId ? null : log.id)}
                    className="text-[11px] transition-opacity hover:opacity-80 opacity-0 group-hover:opacity-100"
                    style={{ color: "#6a6aaa" }}>[编辑]</button>
                  <button onClick={() => deleteLog(log.id)} className="text-[11px] transition-opacity hover:opacity-80" style={{ color: "#3a2a4a" }}>[删]</button>
                </div>
              </div>
              {editingLogId === log.id ? (
                <InlineLogEdit logId={log.id} text={log.text} onDone={() => setEditingLogId(null)} />
              ) : (
                log.text && <p className="text-[13px] leading-relaxed mb-2" style={{ color: "#9a9ac8" }}>{log.text}</p>
              )}
              {log.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {log.images.map((src, i) => (
                    <img key={i} src={src} alt="" className="h-20 w-auto cursor-pointer object-cover"
                      style={{ border: "1px solid #2a2a6a" }} onClick={() => setExpandedImg(src)} />
                  ))}
                </div>
              )}
              {linked ? (
                <button onClick={() => openTodo(linked.id)} className="text-[11px] transition-opacity hover:opacity-80" style={{ color }}>
                  → #{linked.id} {linked.title.slice(0, 20)}{linked.title.length > 20 ? "…" : ""}
                </button>
              ) : (
                <span className="text-[11px]" style={{ color: "#2a2a5a" }}>未关联目标</span>
              )}
            </div>
          );
        })}
      </div>

      {expandedImg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.9)" }} onClick={() => setExpandedImg(null)}>
          <img src={expandedImg} alt="" className="max-w-full max-h-full" />
        </div>
      )}
    </div>
  );
}
