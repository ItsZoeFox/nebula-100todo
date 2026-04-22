"use client";
import { useState, useEffect } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

export default function NotificationSetup() {
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied" | "unsupported">("idle");

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported"); return;
    }
    if (Notification.permission === "granted") setStatus("granted");
    else if (Notification.permission === "denied") setStatus("denied");
  }, []);

  async function enable() {
    setStatus("loading");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("denied"); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });

      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setStatus("granted");
    } catch (e) {
      console.error(e);
      setStatus("idle");
    }
  }

  if (status === "granted") {
    return (
      <span className="text-[10px]" style={{ color: "#4ade80", fontFamily: "'Press Start 2P', monospace" }}>
        🔔 通知已开启
      </span>
    );
  }
  if (status === "denied" || status === "unsupported") return null;

  return (
    <button
      onClick={enable}
      disabled={status === "loading"}
      className="text-[10px] px-2 py-1 transition-opacity hover:opacity-80 disabled:opacity-50"
      style={{ border: "1px solid #4a4a6a", color: "#6a6aaa", fontFamily: "'Press Start 2P', monospace" }}
    >
      {status === "loading" ? "开启中..." : "🔔 开启通知"}
    </button>
  );
}
