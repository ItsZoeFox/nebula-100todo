"use client";
import { useState } from "react";
import { useTodoStore } from "@/app/store/useTodoStore";

const PRESET_COLORS = [
  "#c084fc","#f87171","#fb923c","#fbbf24","#4ade80",
  "#22d3ee","#38bdf8","#818cf8","#a3e635","#34d399",
  "#f59e0b","#e879f9","#4a4a6a",
];

export default function CategoryManager({ onClose }: { onClose: () => void }) {
  const categories = useTodoStore((s) => s.categories);
  const todos = useTodoStore((s) => s.todos);
  const addCategory = useTodoStore((s) => s.addCategory);
  const editCategory = useTodoStore((s) => s.editCategory);
  const deleteCategory = useTodoStore((s) => s.deleteCategory);

  const [editingName, setEditingName] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [editColor, setEditColor] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#c084fc");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function startEdit(name: string, color: string) {
    setEditingName(name);
    setEditVal(name);
    setEditColor(color);
  }

  function saveEdit() {
    if (!editingName) return;
    editCategory(editingName, editVal, editColor);
    setEditingName(null);
  }

  function handleAdd() {
    if (!newName.trim()) return;
    addCategory(newName.trim(), newColor);
    setNewName("");
  }

  function countTodos(cat: string) {
    return todos.filter((t) => t.cat === cat).length;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,10,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full flex flex-col gap-0 overflow-hidden"
        style={{
          maxWidth: 480,
          maxHeight: "85vh",
          background: "#06061e",
          border: "1px solid #2a2a6a",
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#1a1a4a" }}>
          <span className="text-[14px]" style={{ color: "#6a6aaa" }}>⚙ 管理类目</span>
          <button onClick={onClose} className="text-[14px]" style={{ color: "#4a4a8a" }}>[×]</button>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
          {categories.map((cat) => {
            const isProtected = cat.name === "未分类";
            const count = countTodos(cat.name);

            if (editingName === cat.name) {
              return (
                <div key={cat.name} className="flex items-center gap-2 p-2" style={{ border: `1px solid ${cat.color}55` }}>
                  {/* Color picker */}
                  <div className="relative shrink-0">
                    <div className="w-5 h-5 cursor-pointer" style={{ background: editColor }} />
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  <input
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    className="flex-1 px-2 py-1 text-[12px] outline-none"
                    style={{ background: "#0a0a2a", border: "1px solid #2a2a6a", color: "#c8c8ff", fontFamily: "'Press Start 2P', monospace" }}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    autoFocus
                  />
                  <button onClick={saveEdit} className="text-[11px] px-2 py-1" style={{ border: "1px solid #4a4aaa", color: "#8888cc" }}>✓</button>
                  <button onClick={() => setEditingName(null)} className="text-[11px] px-2 py-1" style={{ border: "1px solid #2a2a4a", color: "#4a4a6a" }}>✗</button>
                </div>
              );
            }

            return (
              <div key={cat.name} className="flex items-center gap-3 px-3 py-2" style={{ border: "1px solid #1a1a3a" }}>
                <span className="w-4 h-4 shrink-0" style={{ background: cat.color }} />
                <span className="flex-1 text-[13px]" style={{ color: "#9a9ac8" }}>{cat.name}</span>
                <span className="text-[11px]" style={{ color: "#3a3a6a" }}>{count}项</span>
                {!isProtected && (
                  <>
                    <button
                      onClick={() => startEdit(cat.name, cat.color)}
                      className="text-[11px] px-2 py-1 transition-opacity hover:opacity-80"
                      style={{ border: "1px solid #2a2a6a", color: "#6a6aaa" }}
                    >✎</button>
                    <button
                      onClick={() => setConfirmDelete(cat.name)}
                      className="text-[11px] px-2 py-1 transition-opacity hover:opacity-80"
                      style={{ border: "1px solid #2a1a1a", color: "#6a3a3a" }}
                    >🗑</button>
                  </>
                )}
                {isProtected && <span className="text-[10px]" style={{ color: "#2a2a4a" }}>锁定</span>}
              </div>
            );
          })}
        </div>

        {/* Add new category */}
        <div className="px-5 py-4 border-t flex flex-col gap-3" style={{ borderColor: "#1a1a4a" }}>
          <span className="text-[12px]" style={{ color: "#4a4a8a" }}>+ 新增类目</span>
          <div className="flex items-center gap-2">
            {/* Color preset swatches */}
            <div className="flex flex-wrap gap-1 flex-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-5 h-5 shrink-0 transition-transform hover:scale-110"
                  style={{
                    background: c,
                    outline: newColor === c ? `2px solid #fff` : "none",
                    outlineOffset: 1,
                  }}
                />
              ))}
              {/* Custom color picker */}
              <div className="relative w-5 h-5">
                <div className="w-5 h-5" style={{ background: "linear-gradient(135deg, #f00, #0f0, #00f)" }} />
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="自定义颜色"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-5 h-5 shrink-0 mt-2" style={{ background: newColor }} />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="类目名称..."
              className="flex-1 px-3 py-2 text-[12px] outline-none"
              style={{ background: "#0a0a2a", border: "1px solid #2a2a6a", color: "#c8c8ff", fontFamily: "'Press Start 2P', monospace" }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-3 py-2 text-[12px] transition-opacity hover:opacity-80 disabled:opacity-30"
              style={{ background: "#1a1a4a", border: "1px solid #4a4aaa", color: "#8888cc", fontFamily: "'Press Start 2P', monospace" }}
            >
              添加
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,10,0.88)" }}
        >
          <div
            className="w-full p-5 flex flex-col gap-4"
            style={{ maxWidth: 340, background: "#06061e", border: "1px solid #ef444455", fontFamily: "'Press Start 2P', monospace" }}
          >
            <p className="text-[12px] leading-relaxed" style={{ color: "#c8c8ff" }}>
              删除「{confirmDelete}」？<br />
              <span style={{ color: "#6a6a9a" }}>该类目下的 {countTodos(confirmDelete)} 个目标将自动移入「未分类」。</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { deleteCategory(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 py-2 text-[12px]"
                style={{ background: "#3a0a0a", border: "1px solid #ef4444", color: "#ef4444", fontFamily: "'Press Start 2P', monospace" }}
              >确认删除</button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 text-[12px]"
                style={{ border: "1px solid #2a2a6a", color: "#6a6aaa", fontFamily: "'Press Start 2P', monospace" }}
              >取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
