"use client";
import { useState, useEffect } from "react";
import { useTodoStore } from "@/app/store/useTodoStore";

export default function MonthlyFocusModal({ onClose }: { onClose: () => void }) {
  const categories = useTodoStore((s) => s.categories);
  const todos = useTodoStore((s) => s.todos);
  const getCatColor = useTodoStore((s) => s.getCatColor);
  const monthlyFocus = useTodoStore((s) => s.monthlyFocus);
  const setMonthlyFocus = useTodoStore((s) => s.setMonthlyFocus);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [themeCat, setThemeCat] = useState(monthlyFocus?.themeCat ?? categories[0]?.name ?? "");
  const [goalIds, setGoalIds] = useState<number[]>(monthlyFocus?.goalIds ?? []);

  useEffect(() => {
    if (monthlyFocus) { setThemeCat(monthlyFocus.themeCat); setGoalIds(monthlyFocus.goalIds); }
  }, [monthlyFocus]);

  const catTodos = todos.filter((t) => t.cat === themeCat && t.status !== "done");
  const color = getCatColor(themeCat);

  function toggleGoal(id: number) {
    setGoalIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  }

  function handleSave() {
    if (!themeCat) return;
    setMonthlyFocus({ month: currentMonth, themeCat, goalIds });
    onClose();
  }

  function handleClear() {
    setMonthlyFocus(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,10,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full flex flex-col gap-4 p-5 overflow-y-auto"
        style={{ maxWidth: 500, maxHeight: "85vh", background: "#06061e", border: `1px solid ${color}44`, fontFamily: "'Press Start 2P', monospace" }}>

        <div className="flex items-center justify-between">
          <span className="text-[14px]" style={{ color: "#6a6aaa" }}>★ 主题月设置</span>
          <button onClick={onClose} className="text-[14px]" style={{ color: "#4a4a8a" }}>[×]</button>
        </div>

        <div className="text-[11px]" style={{ color: "#3a3a6a" }}>{currentMonth.replace("-", " 年 ")} 月</div>

        {/* Theme category */}
        <div>
          <div className="text-[11px] mb-2" style={{ color: "#4a4a8a" }}>本月主题领域</div>
          <div className="flex flex-wrap gap-2">
            {categories.filter((c) => c.name !== "未分类").map((c) => (
              <button key={c.name} onClick={() => { setThemeCat(c.name); setGoalIds([]); }}
                className="text-[10px] px-2 py-1 transition-colors"
                style={{
                  border: `1px solid ${themeCat === c.name ? c.color : "#2a2a6a"}`,
                  color: themeCat === c.name ? c.color : "#4a4a8a",
                  background: themeCat === c.name ? `${c.color}15` : "transparent",
                }}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Focus goals */}
        <div>
          <div className="text-[11px] mb-2" style={{ color: "#4a4a8a" }}>
            聚焦目标（最多5个）— 已选 {goalIds.length}/5
          </div>
          {catTodos.length === 0 ? (
            <div className="text-[11px]" style={{ color: "#3a3a6a" }}>该领域没有未完成的目标</div>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {catTodos.map((t) => {
                const selected = goalIds.includes(t.id);
                return (
                  <button key={t.id} onClick={() => toggleGoal(t.id)}
                    className="flex items-center gap-2 p-2 text-left transition-colors"
                    style={{
                      border: `1px solid ${selected ? color : "#2a2a6a"}`,
                      background: selected ? `${color}15` : "transparent",
                    }}>
                    <span className="shrink-0 w-3 h-3 flex items-center justify-center"
                      style={{ border: `1px solid ${selected ? color : "#3a3a6a"}`, background: selected ? `${color}44` : "transparent" }}>
                      {selected && <span className="text-[7px]" style={{ color }}>✓</span>}
                    </span>
                    <span className="text-[10px] leading-relaxed" style={{ color: selected ? color : "#6a6aaa" }}>
                      #{t.id} {t.title.slice(0, 28)}{t.title.length > 28 ? "…" : ""}
                    </span>
                    <span className="ml-auto text-[10px] shrink-0" style={{ color: "#3a3a6a" }}>
                      {Math.round(t.progress * 100)}%
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={!themeCat || goalIds.length === 0}
            className="flex-1 py-2 text-[12px] transition-opacity hover:opacity-80 disabled:opacity-30"
            style={{ background: `${color}22`, border: `1px solid ${color}66`, color, fontFamily: "'Press Start 2P', monospace" }}>
            [ 确认设置 ]
          </button>
          {monthlyFocus && (
            <button onClick={handleClear}
              className="px-3 py-2 text-[11px] transition-opacity hover:opacity-80"
              style={{ border: "1px solid #3a2a4a", color: "#4a3a5a" }}>
              清除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
