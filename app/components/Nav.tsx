"use client";
import { useTodoStore } from "@/app/store/useTodoStore";
import type { TabId } from "@/app/data/todos";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "galaxy", label: "星云", icon: "◈" },
  { id: "list",   label: "列表", icon: "≡" },
  { id: "logs",   label: "记录", icon: "✦" },
];

interface NavProps {
  onQuickLog: () => void;
}

export default function Nav({ onQuickLog }: NavProps) {
  const activeTab = useTodoStore((s) => s.activeTab);
  const setActiveTab = useTodoStore((s) => s.setActiveTab);

  return (
    <>
      {/* ── Desktop: top bar ─────────────────────────── */}
      <nav
        className="hidden md:flex items-center justify-between px-6 h-14 border-b shrink-0"
        style={{
          background: "rgba(4,4,26,0.97)",
          borderColor: "#1a1a4a",
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        <span className="text-[13px]" style={{ color: "#3a3a7a" }}>◈ NEBULA</span>

        {/* Tab switcher */}
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-4 py-2 text-[12px] transition-colors"
              style={{
                color: activeTab === t.id ? "#e0e0ff" : "#4a4a8a",
                background: activeTab === t.id ? "#1a1a4a" : "transparent",
                border: activeTab === t.id ? "1px solid #3a3a8a" : "1px solid transparent",
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={onQuickLog}
          className="px-4 py-2 text-[12px] transition-opacity hover:opacity-80"
          style={{
            background: "#2a1a5a",
            border: "1px solid #6a3aaa",
            color: "#c084fc",
            fontFamily: "'Press Start 2P', monospace",
          }}
        >
          + 记录
        </button>
      </nav>

      {/* ── Mobile: bottom bar ───────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center"
        style={{
          background: "rgba(4,4,26,0.97)",
          borderTop: "1px solid #1a1a4a",
          fontFamily: "'Press Start 2P', monospace",
          height: 60,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors"
            style={{ color: activeTab === t.id ? "#c084fc" : "#3a3a6a" }}
          >
            <span className="text-[16px]">{t.icon}</span>
            <span className="text-[9px]">{t.label}</span>
          </button>
        ))}
        <button
          onClick={onQuickLog}
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full"
          style={{ color: "#c084fc" }}
        >
          <span className="text-[20px]">+</span>
          <span className="text-[9px]">记录</span>
        </button>
      </nav>
    </>
  );
}
