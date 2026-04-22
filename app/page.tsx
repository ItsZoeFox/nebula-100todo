"use client";
import { useEffect, useState } from "react";
import { useTodoStore } from "@/app/store/useTodoStore";
import Galaxy from "@/app/components/Galaxy";
import HUD from "@/app/components/HUD";
import DetailPanel from "@/app/components/DetailPanel";
import Nav from "@/app/components/Nav";
import ListView from "@/app/components/ListView";
import LogsView from "@/app/components/LogsView";
import QuickLogModal from "@/app/components/QuickLogModal";
import GoalFormModal from "@/app/components/GoalFormModal";
import MonthlyFocusBanner from "@/app/components/MonthlyFocusBanner";
import DailyGoalModal from "@/app/components/DailyGoalModal";

export default function Home() {
  const initStore = useTodoStore((s) => s.initStore);
  const syncFromCloud = useTodoStore((s) => s.syncFromCloud);
  const syncToCloud = useTodoStore((s) => s.syncToCloud);
  const activeTab = useTodoStore((s) => s.activeTab);
  const selectedId = useTodoStore((s) => s.selectedId);
  const setSelected = useTodoStore((s) => s.setSelected);

  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickLogTodoId, setQuickLogTodoId] = useState<number | undefined>(undefined);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);

  useEffect(() => {
    // 1. Init from localStorage first (instant)
    initStore();
    // 2. Then pull cloud state (source of truth across devices)
    syncFromCloud().then(() => {
      // Show daily modal only once per calendar day
      const todayStr = new Date().toDateString();
      const lastShown = localStorage.getItem("nebula_daily_shown");
      if (lastShown !== todayStr) {
        setTimeout(() => {
          setShowDailyModal(true);
          localStorage.setItem("nebula_daily_shown", todayStr);
        }, 400);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to cloud on any state change (debounced 1.5s)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const unsub = useTodoStore.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(() => syncToCloud(), 1500);
    });
    return () => { unsub(); clearTimeout(timer); };
  }, [syncToCloud]);

  // Refresh from cloud when tab becomes visible again (handles multi-device edits)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        initStore();
        syncFromCloud();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [initStore, syncFromCloud]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setSelected]);

  const panelOpen = selectedId !== null;

  function openQuickLog(todoId?: number) {
    setQuickLogTodoId(todoId);
    setShowQuickLog(true);
  }

  return (
    <main
      className="flex flex-col w-screen h-screen overflow-hidden"
      style={{ background: "#03030f" }}
    >
      {/* Desktop top nav */}
      <Nav onQuickLog={() => openQuickLog()} />

      {/* Monthly focus banner */}
      <MonthlyFocusBanner />

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main view */}
        <div
          className="flex-1 overflow-hidden transition-all duration-300 relative"
          style={{ marginRight: panelOpen ? "min(400px, 100vw)" : 0 }}
        >
          {activeTab === "galaxy" && (
            <div className="relative w-full h-full">
              <StarField />
              <Galaxy />
              <HUD />
            </div>
          )}
          {activeTab === "list" && (
            <div className="w-full h-full" style={{ background: "#03030f" }}>
              <ListView onAddGoal={() => setShowAddGoal(true)} />
            </div>
          )}
          {activeTab === "logs" && (
            <div className="w-full h-full" style={{ background: "#03030f" }}>
              <LogsView />
            </div>
          )}
        </div>

        {/* Detail panel */}
        <DetailPanel />
      </div>

      {/* Mobile bottom nav padding */}
      <div className="md:hidden h-[60px] shrink-0" />

      {/* Modals */}
      {showDailyModal && (
        <DailyGoalModal
          onClose={() => setShowDailyModal(false)}
          onQuickLog={(id) => openQuickLog(id)}
        />
      )}
      {showQuickLog && (
        <QuickLogModal
          defaultTodoId={quickLogTodoId}
          onClose={() => { setShowQuickLog(false); setQuickLogTodoId(undefined); }}
        />
      )}
      {showAddGoal && <GoalFormModal mode="add" onClose={() => setShowAddGoal(false)} />}
    </main>
  );
}

function StarField() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    x: +((Math.sin(i * 137.5) * 0.5 + 0.5) * 100).toFixed(3),
    y: +((Math.cos(i * 97.3) * 0.5 + 0.5) * 100).toFixed(3),
    size: i % 7 === 0 ? 2 : 1,
    opacity: +(0.08 + (i % 5) * 0.06).toFixed(2),
  }));

  if (!mounted) return <div className="absolute inset-0 pointer-events-none" />;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s) => (
        <div key={s.id} className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, background: "#c8c8ff", opacity: s.opacity }} />
      ))}
    </div>
  );
}
