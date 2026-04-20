"use client";
import { useState } from "react";
import { useTodoStore } from "@/app/store/useTodoStore";
import MonthlyFocusModal from "./MonthlyFocusModal";

function daysLeftInMonth(): number {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return last.getDate() - now.getDate();
}

export default function MonthlyFocusBanner() {
  const monthlyFocus = useTodoStore((s) => s.monthlyFocus);
  const todos = useTodoStore((s) => s.todos);
  const getCatColor = useTodoStore((s) => s.getCatColor);
  const [showModal, setShowModal] = useState(false);

  const color = monthlyFocus ? getCatColor(monthlyFocus.themeCat) : "#4a4a8a";
  const focusTodos = monthlyFocus
    ? monthlyFocus.goalIds.map((id) => todos.find((t) => t.id === id)).filter(Boolean) as typeof todos
    : [];

  if (!monthlyFocus) {
    return (
      <>
        <button onClick={() => setShowModal(true)}
          className="w-full px-4 py-2 text-[11px] text-left transition-opacity hover:opacity-80"
          style={{ background: "#08082a", borderBottom: "1px solid #2a2a5a", color: "#7a7ac8", fontFamily: "'Press Start 2P', monospace" }}>
          ★ 点击设置本月主题月 →
        </button>
        {showModal && <MonthlyFocusModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  const avgProgress = focusTodos.length > 0
    ? focusTodos.reduce((sum, t) => sum + t.progress, 0) / focusTodos.length
    : 0;
  const daysLeft = daysLeftInMonth();

  return (
    <>
      <div className="shrink-0 px-4 py-2" style={{ background: `${color}08`, borderBottom: `1px solid ${color}22`, fontFamily: "'Press Start 2P', monospace" }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color }}>★ 主题月</span>
            <span className="text-[11px]" style={{ color: `${color}cc` }}>{monthlyFocus.themeCat}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px]" style={{ color: "#3a3a6a" }}>剩余 {daysLeft} 天</span>
            <button onClick={() => setShowModal(true)} className="text-[10px] transition-opacity hover:opacity-80" style={{ color: "#3a3a6a" }}>✎</button>
          </div>
        </div>

        {/* Progress bar across all focus goals */}
        <div className="h-1 w-full mb-2" style={{ background: "#1a1a3a" }}>
          <div className="h-full transition-all" style={{ width: `${Math.round(avgProgress * 100)}%`, background: color }} />
        </div>

        {/* Focus goal pills */}
        <div className="flex flex-wrap gap-1">
          {focusTodos.map((t) => (
            <span key={t.id} className="text-[9px] px-2 py-0.5"
              style={{ border: `1px solid ${color}44`, color: t.status === "done" ? color : `${color}88`, background: t.status === "done" ? `${color}22` : "transparent" }}>
              {t.status === "done" ? "✓ " : ""}{t.title.slice(0, 16)}{t.title.length > 16 ? "…" : ""}
            </span>
          ))}
        </div>
      </div>

      {showModal && <MonthlyFocusModal onClose={() => setShowModal(false)} />}
    </>
  );
}
