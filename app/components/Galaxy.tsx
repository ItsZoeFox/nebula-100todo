"use client";
import { useMemo } from "react";
import { useTodoStore } from "@/app/store/useTodoStore";

function getPositions(n: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const r = Math.sqrt(i / n) * 40;
    const theta = i * golden;
    return { x: 50 + r * Math.cos(theta), y: 50 + r * Math.sin(theta) * 0.75 };
  });
}

function ConstellationOverlay({
  positions, focusIndices, color,
}: {
  positions: { x: number; y: number }[];
  focusIndices: number[];
  color: string;
}) {
  if (focusIndices.length < 2) return null;
  const pts = focusIndices.map((i) => positions[i]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
      <defs>
        <filter id="glow-line">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {pts.map((pt, idx) => {
        if (idx === 0) return null;
        const prev = pts[idx - 1];
        return (
          <line key={idx}
            x1={`${prev.x}%`} y1={`${prev.y}%`}
            x2={`${pt.x}%`} y2={`${pt.y}%`}
            stroke={color} strokeWidth="1" strokeOpacity="0.45"
            strokeDasharray="4 5" filter="url(#glow-line)" />
        );
      })}
      {/* Close back to first point */}
      {pts.length >= 3 && (
        <line
          x1={`${pts[pts.length - 1].x}%`} y1={`${pts[pts.length - 1].y}%`}
          x2={`${pts[0].x}%`} y2={`${pts[0].y}%`}
          stroke={color} strokeWidth="1" strokeOpacity="0.25"
          strokeDasharray="4 5" filter="url(#glow-line)" />
      )}
    </svg>
  );
}

export default function Galaxy() {
  const todos = useTodoStore((s) => s.todos);
  const dailyId = useTodoStore((s) => s.dailyId);
  const selectedId = useTodoStore((s) => s.selectedId);
  const setSelected = useTodoStore((s) => s.setSelected);
  const getCatColor = useTodoStore((s) => s.getCatColor);
  const monthlyFocus = useTodoStore((s) => s.monthlyFocus);
  const positions = useMemo(() => getPositions(todos.length), [todos.length]);

  if (!todos.length) return null;

  // Build focus constellation indices
  const focusIndices = monthlyFocus
    ? monthlyFocus.goalIds
        .map((id) => todos.findIndex((t) => t.id === id))
        .filter((i) => i !== -1)
    : [];
  const focusColor = monthlyFocus ? getCatColor(monthlyFocus.themeCat) : "#ffffff";
  const focusSet = new Set(monthlyFocus?.goalIds ?? []);

  return (
    <div className="relative w-full h-full">
      <ConstellationOverlay positions={positions} focusIndices={focusIndices} color={focusColor} />

      {todos.map((todo, i) => {
        const pos = positions[i];
        const color = getCatColor(todo.cat);
        const isDaily = todo.id === dailyId;
        const isSelected = todo.id === selectedId;
        const isFocus = focusSet.has(todo.id);
        const size = 8 + todo.progress * 10;
        const opacity = todo.status === "not_started" ? 0.28 : 0.5 + todo.progress * 0.5;
        const glow =
          todo.status === "done" ? `0 0 6px ${color}, 0 0 14px ${color}, 0 0 28px ${color}` :
          todo.status === "blocked" ? "0 0 6px #ef4444, 0 0 12px #ef4444" :
          todo.status === "in_progress" ? `0 0 4px ${color}, 0 0 10px ${color}` : "none";

        const focusRing = isFocus
          ? `0 0 0 2px ${focusColor}88, 0 0 10px ${focusColor}66`
          : "";
        const boxShadow = isSelected
          ? `0 0 0 2px #fff, 0 0 12px ${color}`
          : isDaily
          ? `0 0 0 2px ${color}, ${glow}`
          : isFocus
          ? `${focusRing}, ${glow !== "none" ? glow : ""}`
          : glow;

        return (
          <button
            key={todo.id}
            onClick={() => setSelected(isSelected ? null : todo.id)}
            className="absolute group flex items-center justify-center"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)", zIndex: isSelected || isDaily ? 20 : isFocus ? 15 : 10 }}
            title={`#${todo.id} ${todo.title}`}
          >
            <span
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 text-[13px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30"
              style={{ background: "rgba(4,4,28,0.95)", border: `1px solid ${color}`, color, fontFamily: "'Press Start 2P', monospace" }}
            >
              #{todo.id}
            </span>
            <span
              className="block"
              style={{
                width: size, height: size, background: color, opacity,
                boxShadow,
                imageRendering: "pixelated",
                animation: isDaily ? "pulse 1.8s ease-in-out infinite" : undefined,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
