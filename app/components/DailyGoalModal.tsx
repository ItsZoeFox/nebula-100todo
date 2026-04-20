"use client";
import { useTodoStore } from "@/app/store/useTodoStore";

interface Props {
  onClose: () => void;
  onQuickLog: (todoId: number) => void;
}

export default function DailyGoalModal({ onClose, onQuickLog }: Props) {
  const todos = useTodoStore((s) => s.todos);
  const dailyId = useTodoStore((s) => s.dailyId);
  const swapDaily = useTodoStore((s) => s.swapDaily);
  const getCatColor = useTodoStore((s) => s.getCatColor);

  const todo = todos.find((t) => t.id === dailyId);
  if (!todo) return null;

  const color = getCatColor(todo.cat);
  const pct = Math.round(todo.progress * 100);

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,10,0.88)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full flex flex-col gap-5 p-6"
        style={{ maxWidth: 460, background: "#06061e", border: `2px solid ${color}55`, fontFamily: "'Press Start 2P', monospace" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] tracking-widest" style={{ color: `${color}88` }}>✦ TODAY&apos;S STAR ✦</span>
          <button onClick={onClose} className="text-[14px]" style={{ color: "#4a4a8a" }}>[×]</button>
        </div>

        {/* Goal */}
        <div>
          <div className="text-[11px] mb-2" style={{ color: `${color}66` }}>#{String(todo.id).padStart(2, "0")} · {todo.cat}</div>
          <div className="text-[16px] leading-relaxed" style={{ color: "#e8e8ff" }}>{todo.title}</div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="h-2 w-full mb-1" style={{ background: "#1a1a3a" }}>
            <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
          </div>
          <div className="text-[10px]" style={{ color: "#3a3a6a" }}>当前进度 {pct}%</div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { onQuickLog(todo.id); onClose(); }}
            className="w-full py-3 text-[13px] transition-opacity hover:opacity-80"
            style={{ background: `${color}22`, border: `1px solid ${color}88`, color, fontFamily: "'Press Start 2P', monospace" }}
          >
            [ + 记录今日进展 ]
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => { swapDaily(); }}
              className="flex-1 py-2 text-[11px] transition-opacity hover:opacity-80"
              style={{ border: "1px solid #2a2a6a", color: "#4a4a8a" }}
            >
              换一个 →
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 text-[11px] transition-opacity hover:opacity-80"
              style={{ border: "1px solid #2a2a5a", color: "#5a5a9a" }}
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
