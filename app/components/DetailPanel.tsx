"use client";
import { useState, useRef } from "react";
import { useTodoStore } from "@/app/store/useTodoStore";
import type { Status, TodoRecord } from "@/app/data/todos";
import GoalFormModal from "./GoalFormModal";
import ConfirmDialog from "./ConfirmDialog";

const STATUS_LABELS: Record<Status, string> = {
  not_started: "未开始", in_progress: "进行中", blocked: "卡住了", done: "完成 ✓",
};

function InlineLogEdit({ logId, text, onDone }: { logId: string; text: string; onDone: () => void }) {
  const editLog = useTodoStore((s) => s.editLog);
  const [val, setVal] = useState(text);
  function save() { editLog(logId, val); onDone(); }
  return (
    <div className="flex flex-col gap-1 mt-1">
      <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={3} autoFocus
        className="w-full p-2 text-[12px] resize-none outline-none leading-relaxed"
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

function SubTaskSection({ todo, color }: { todo: TodoRecord; color: string }) {
  const addSubTask = useTodoStore((s) => s.addSubTask);
  const toggleSubTask = useTodoStore((s) => s.toggleSubTask);
  const deleteSubTask = useTodoStore((s) => s.deleteSubTask);
  const [newText, setNewText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const subTasks = todo.subTasks ?? [];
  const doneCount = subTasks.filter((st) => st.done).length;

  function handleAdd() {
    if (!newText.trim()) return;
    addSubTask(todo.id, newText.trim());
    setNewText("");
    inputRef.current?.focus();
  }

  return (
    <div className="px-5 mt-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px]" style={{ color: "#4a4a8a" }}>
          子任务 {subTasks.length > 0 ? `(${doneCount}/${subTasks.length})` : ""}
        </span>
      </div>

      {subTasks.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {subTasks.map((st) => (
            <div key={st.id} className="flex items-center gap-2 group">
              <button onClick={() => toggleSubTask(todo.id, st.id)}
                className="shrink-0 w-4 h-4 flex items-center justify-center transition-colors"
                style={{ border: `1px solid ${st.done ? color : "#3a3a6a"}`, background: st.done ? `${color}33` : "transparent" }}>
                {st.done && <span className="text-[8px]" style={{ color }}>✓</span>}
              </button>
              <span className="text-[11px] flex-1 leading-relaxed"
                style={{ color: st.done ? "#3a3a6a" : "#9a9ac8", textDecoration: st.done ? "line-through" : "none" }}>
                {st.text}
              </span>
              <button onClick={() => deleteSubTask(todo.id, st.id)}
                className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "#3a2a4a" }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input ref={inputRef} value={newText} onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="添加子任务..."
          className="flex-1 px-2 py-1 text-[11px] outline-none"
          style={{ background: "#0a0a2a", border: "1px solid #2a2a6a", color: "#c8c8ff", fontFamily: "'Press Start 2P', monospace" }} />
        <button onClick={handleAdd} className="text-[11px] px-2 py-1 transition-opacity hover:opacity-80"
          style={{ border: `1px solid ${color}44`, color: `${color}99` }}>+</button>
      </div>
      {subTasks.length > 0 && (
        <div className="mt-2 text-[10px]" style={{ color: "#3a3a6a" }}>子任务完成情况自动更新进度条</div>
      )}
    </div>
  );
}

export default function DetailPanel() {
  const selectedId = useTodoStore((s) => s.selectedId);
  const todos = useTodoStore((s) => s.todos);
  const logs = useTodoStore((s) => s.logs);
  const setSelected = useTodoStore((s) => s.setSelected);
  const setStatus = useTodoStore((s) => s.setStatus);
  const setProgress = useTodoStore((s) => s.setProgress);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);
  const deleteLog = useTodoStore((s) => s.deleteLog);
  const addLog = useTodoStore((s) => s.addLog);
  const getCatColor = useTodoStore((s) => s.getCatColor);

  const [sortDesc, setSortDesc] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [expandedImg, setExpandedImg] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [showInlineLog, setShowInlineLog] = useState(false);
  const [inlineText, setInlineText] = useState("");

  const todo: TodoRecord | undefined = todos.find((t) => t.id === selectedId);
  if (!todo) return null;

  const color = getCatColor(todo.cat);
  const progressPct = Math.round(todo.progress * 100);
  const todoLogs = logs.filter((l) => l.todoId === todo.id);
  const sortedLogs = [...todoLogs].sort((a, b) => sortDesc ? b.ts - a.ts : a.ts - b.ts);
  const hasSubTasks = (todo.subTasks ?? []).length > 0;

  function handleDelete() {
    deleteTodo(todo!.id);
    setShowDelete(false);
  }

  function handleInlineLogSave() {
    if (!inlineText.trim()) return;
    addLog(inlineText.trim(), [], todo!.id);
    setInlineText("");
    setShowInlineLog(false);
  }

  return (
    <>
      <div
        className="fixed top-0 right-0 h-full flex flex-col overflow-y-auto z-50"
        style={{ width: "min(400px, 100vw)", background: "rgba(4,4,26,0.97)", borderLeft: `2px solid ${color}44`, fontFamily: "'Press Start 2P', monospace" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className="flex-1 min-w-0">
            <div className="text-[14px] mb-2" style={{ color: `${color}99` }}>#{String(todo.id).padStart(2, "0")} · {todo.cat}</div>
            <div className="text-[14px] leading-relaxed text-slate-200 pr-2">{todo.title}</div>
          </div>
          <button onClick={() => setSelected(null)} className="text-[16px] mt-1 ml-3 shrink-0" style={{ color: "#4a4a8a" }}>[×]</button>
        </div>

        {/* Edit / Delete */}
        <div className="flex gap-2 px-5 mt-3">
          <button onClick={() => setShowEdit(true)} className="text-[11px] px-3 py-1 transition-opacity hover:opacity-80" style={{ border: `1px solid ${color}44`, color: `${color}99` }}>✎ 编辑</button>
          <button onClick={() => setShowDelete(true)} className="text-[11px] px-3 py-1 transition-opacity hover:opacity-80" style={{ border: "1px solid #ef444433", color: "#ef4444aa" }}>🗑 删除</button>
        </div>

        {/* Progress */}
        <div className="px-5 mt-4">
          <div className="text-[12px] mb-2" style={{ color: "#4a4a8a" }}>
            PROGRESS · {progressPct}%{hasSubTasks ? " (由子任务决定)" : ""}
          </div>
          <div className="h-2 w-full mb-1" style={{ background: "#1a1a3a" }}>
            <div className="h-full transition-all" style={{ width: `${progressPct}%`, background: color }} />
          </div>
          {!hasSubTasks && (
            <input type="range" min={0} max={100} value={progressPct}
              onChange={(e) => setProgress(todo.id, Number(e.target.value) / 100)}
              className="w-full accent-violet-400 mt-2" />
          )}
        </div>

        {/* Status */}
        <div className="px-5 mt-3 flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
            <button key={s} onClick={() => setStatus(todo.id, s)}
              className="text-[12px] px-3 py-2 border transition-colors"
              style={{
                borderColor: todo.status === s ? color : "#2a2a6a",
                color: todo.status === s ? color : "#5a5a9a",
                background: todo.status === s ? `${color}15` : "transparent",
              }}
            >{STATUS_LABELS[s]}</button>
          ))}
        </div>

        {/* SubTask Checklist */}
        <SubTaskSection todo={todo} color={color} />

        {/* Timeline */}
        <div className="px-5 mt-5 mb-8 flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px]" style={{ color: "#4a4a8a" }}>记录 ({todoLogs.length})</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowInlineLog((v) => !v); setInlineText(""); }}
                className="text-[11px] px-2 py-0.5 transition-opacity hover:opacity-80"
                style={{ border: `1px solid ${color}55`, color: `${color}cc` }}
              >+ 添加</button>
              <button onClick={() => setSortDesc((v) => !v)} className="text-[11px] transition-opacity hover:opacity-80" style={{ color: "#3a3a7a" }}>
                {sortDesc ? "新→旧 ↓" : "旧→新 ↑"}
              </button>
            </div>
          </div>

          {/* Inline add log form */}
          {showInlineLog && (
            <div className="mb-4 p-3" style={{ border: `1px solid ${color}33`, background: "#08082a" }}>
              <textarea
                autoFocus
                value={inlineText}
                onChange={(e) => setInlineText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleInlineLogSave(); }}
                placeholder="写下进展、卡点或任何想法..."
                rows={3}
                className="w-full p-2 text-[12px] resize-none outline-none leading-relaxed mb-2"
                style={{ background: "#0a0a2a", border: "1px solid #2a2a6a", color: "#c8c8ff", fontFamily: "'Press Start 2P', monospace" }}
              />
              <div className="flex gap-2">
                <button onClick={handleInlineLogSave} disabled={!inlineText.trim()}
                  className="text-[11px] px-3 py-1 transition-opacity hover:opacity-80 disabled:opacity-30"
                  style={{ background: `${color}22`, border: `1px solid ${color}66`, color, fontFamily: "'Press Start 2P', monospace" }}>
                  保存
                </button>
                <button onClick={() => { setShowInlineLog(false); setInlineText(""); }}
                  className="text-[11px] px-3 py-1 transition-opacity hover:opacity-80"
                  style={{ border: "1px solid #2a2a6a", color: "#4a4a8a" }}>
                  取消
                </button>
                <span className="text-[9px] self-center ml-1" style={{ color: "#2a2a5a" }}>⌘↵ 保存</span>
              </div>
            </div>
          )}

          {!sortedLogs.length && !showInlineLog && (
            <div className="text-[11px] mt-4 text-center" style={{ color: "#2a2a5a" }}>还没有记录，点「+ 添加」</div>
          )}
          <div className="flex flex-col gap-3">
            {sortedLogs.map((log) => (
              <div key={log.id} className="pl-3 group" style={{ borderLeft: `2px solid ${color}44` }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[11px]" style={{ color: "#3a3a6a" }}>
                    {log.ts > 0 ? log.date : <span style={{ color: "#2a2a5a" }}>{log.date}</span>}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingLogId(log.id === editingLogId ? null : log.id)}
                      className="text-[10px]" style={{ color: "#6a6aaa" }}>✎</button>
                    <button onClick={() => deleteLog(log.id)}
                      className="text-[10px]" style={{ color: "#3a2a4a" }}>×</button>
                  </div>
                </div>
                {editingLogId === log.id ? (
                  <InlineLogEdit logId={log.id} text={log.text} onDone={() => setEditingLogId(null)} />
                ) : (
                  log.text && <div className="text-[12px] leading-relaxed mb-1" style={{ color: "#9a9ac8" }}>{log.text}</div>
                )}
                {log.images.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {log.images.map((src, i) => (
                      <img key={i} src={src} alt="" className="h-14 w-auto cursor-pointer object-cover"
                        style={{ border: "1px solid #2a2a6a" }} onClick={() => setExpandedImg(src)} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEdit && <GoalFormModal mode="edit" todo={todo} onClose={() => setShowEdit(false)} />}
      {showDelete && (
        <ConfirmDialog
          message={`确认删除「${todo.title.slice(0, 18)}${todo.title.length > 18 ? "…" : ""}」？此操作不可撤销。`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
      {expandedImg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.9)" }} onClick={() => setExpandedImg(null)}>
          <img src={expandedImg} alt="" className="max-w-full max-h-full" />
        </div>
      )}
    </>
  );
}
