"use client";
import { useTodoStore } from "@/app/store/useTodoStore";

export default function HUD() {
  const todos = useTodoStore((s) => s.todos);
  const dailyId = useTodoStore((s) => s.dailyId);
  const swapDaily = useTodoStore((s) => s.swapDaily);
  const setSelected = useTodoStore((s) => s.setSelected);
  const getCatColor = useTodoStore((s) => s.getCatColor);

  const total = todos.length;
  const done = todos.filter((t) => t.status === "done").length;
  const inProgress = todos.filter((t) => t.status === "in_progress").length;
  const blocked = todos.filter((t) => t.status === "blocked").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const dailyTodo = todos.find((t) => t.id === dailyId);
  const dailyColor = dailyTodo ? getCatColor(dailyTodo.cat) : "#8888cc";

  return (
    <>
      <div className="absolute top-4 left-4 z-30" style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <div className="flex gap-4 text-[16px]">
          <span style={{ color: "#fbbf24" }}>✓ {done}</span>
          <span style={{ color: "#4affec" }}>◎ {inProgress}</span>
          <span style={{ color: "#ef4444" }}>✕ {blocked}</span>
          <span style={{ color: "#5a5a9a" }}>/ {total}</span>
        </div>
        <div className="mt-2 h-[3px] w-40" style={{ background: "#1a1a3a" }}>
          <div className="h-full" style={{ width: `${pct}%`, background: "#a855f7" }} />
        </div>
        <div className="text-[13px] mt-1" style={{ color: "#3a3a6a" }}>{pct}% complete</div>
      </div>

      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 text-center px-5 py-3"
        style={{ background: "rgba(4,4,28,0.92)", border: `1px solid ${dailyColor}55`, fontFamily: "'Press Start 2P', monospace", minWidth: 300, maxWidth: "90vw" }}
      >
        <div className="text-[13px] mb-2 tracking-widest" style={{ color: `${dailyColor}88` }}>✦ TODAY&apos;S STAR ✦</div>
        <button
          onClick={() => setSelected(dailyId)}
          className="text-[14px] leading-relaxed block w-full text-left transition-opacity hover:opacity-80"
          style={{ color: dailyColor }}
        >
          #{dailyId} {dailyTodo?.title}
        </button>
        <button onClick={swapDaily} className="text-[13px] mt-2 transition-opacity hover:opacity-80" style={{ color: "#3a3a6a" }}>
          [换一个 →]
        </button>
      </div>

      {/* Top-right: category legend */}
      <CatLegend />
    </>
  );
}

function CatLegend() {
  const categories = useTodoStore((s) => s.categories);
  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col gap-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>
      {categories.filter((c) => c.name !== "未分类").map((cat) => (
        <div key={cat.name} className="flex items-center gap-2">
          <span className="block w-3 h-3" style={{ background: cat.color }} />
          <span className="text-[13px]" style={{ color: "#4a4a7a" }}>{cat.name}</span>
        </div>
      ))}
    </div>
  );
}
