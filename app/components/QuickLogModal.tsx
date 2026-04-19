"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTodoStore } from "@/app/store/useTodoStore";

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      const ratio = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.src = url;
  });
}

async function compressBlob(blob: Blob): Promise<string> {
  return compressImage(new File([blob], "paste.png", { type: blob.type }));
}

export default function QuickLogModal({ onClose }: { onClose: () => void }) {
  const todos = useTodoStore((s) => s.todos);
  const categories = useTodoStore((s) => s.categories);
  const getCatColor = useTodoStore((s) => s.getCatColor);
  const addLog = useTodoStore((s) => s.addLog);

  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [todoId, setTodoId] = useState<number | "">("");
  const [catFilter, setCatFilter] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { textRef.current?.focus(); }, []);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    for (const item of Array.from(e.clipboardData?.items ?? [])) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) setImages((p) => [...p, ""]);  // placeholder
        if (blob) {
          const compressed = await compressBlob(blob);
          setImages((p) => { const next = [...p]; next[next.length - 1] = compressed; return next.filter(Boolean); });
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const compressed = await Promise.all(files.map(compressImage));
    setImages((p) => [...p, ...compressed]);
    e.target.value = "";
  }

  function handleSave() {
    if (!text.trim() && !images.length) return;
    addLog(text.trim(), images, todoId === "" ? undefined : todoId);
    onClose();
  }

  const filteredTodos = catFilter ? todos.filter((t) => t.cat === catFilter) : todos;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,10,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full flex flex-col gap-4 p-5" style={{ maxWidth: 520, background: "#06061e", border: "1px solid #2a2a6a", fontFamily: "'Press Start 2P', monospace" }}>
        <div className="flex items-center justify-between">
          <span className="text-[14px]" style={{ color: "#6a6aaa" }}>✦ 新记录</span>
          <button onClick={onClose} className="text-[14px]" style={{ color: "#4a4a8a" }}>[×]</button>
        </div>

        <textarea ref={textRef} value={text} onChange={(e) => setText(e.target.value)}
          placeholder="写下进展、卡点或任何想法... (可直接粘贴截图)" rows={5}
          className="w-full p-3 text-[13px] resize-none outline-none leading-relaxed"
          style={{ background: "#0a0a2a", border: "1px solid #2a2a6a", color: "#c8c8ff", fontFamily: "'Press Start 2P', monospace" }} />

        {images.filter(Boolean).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.filter(Boolean).map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="h-16 w-auto object-cover" style={{ border: "1px solid #2a2a6a" }} />
                <button onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute top-0 right-0 text-[10px] px-1" style={{ background: "#1a0a2a", color: "#c084fc" }}>×</button>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => fileRef.current?.click()}
          className="text-[12px] px-3 py-2 w-fit transition-opacity hover:opacity-80"
          style={{ border: "1px solid #2a2a6a", color: "#6a6aaa" }}>
          📎 上传图片
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

        <div>
          <div className="text-[11px] mb-2" style={{ color: "#4a4a8a" }}>关联目标（可选）</div>
          <div className="flex flex-wrap gap-1 mb-2">
            <button onClick={() => setCatFilter("")}
              className="text-[10px] px-2 py-1"
              style={{ border: `1px solid ${!catFilter ? "#6a3aaa" : "#2a2a6a"}`, color: !catFilter ? "#c084fc" : "#4a4a8a" }}>
              全部
            </button>
            {categories.map((c) => (
              <button key={c.name} onClick={() => setCatFilter(c.name === catFilter ? "" : c.name)}
                className="text-[10px] px-2 py-1"
                style={{ border: `1px solid ${catFilter === c.name ? c.color : "#2a2a6a"}`, color: catFilter === c.name ? c.color : "#4a4a8a" }}>
                {c.name}
              </button>
            ))}
          </div>
          <select value={todoId} onChange={(e) => setTodoId(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-3 py-2 text-[12px] outline-none"
            style={{ background: "#0a0a2a", border: "1px solid #2a2a6a", color: "#c8c8ff", fontFamily: "'Press Start 2P', monospace" }}>
            <option value="">未关联</option>
            {filteredTodos.map((t) => (
              <option key={t.id} value={t.id} style={{ color: getCatColor(t.cat) }}>
                #{t.id} {t.title.slice(0, 24)}{t.title.length > 24 ? "…" : ""}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleSave} disabled={!text.trim() && !images.filter(Boolean).length}
          className="w-full py-3 text-[13px] transition-opacity hover:opacity-80 disabled:opacity-30"
          style={{ background: "#2a1a5a", border: "1px solid #6a3aaa", color: "#c084fc", fontFamily: "'Press Start 2P', monospace" }}>
          [ 保存记录 ]
        </button>
      </div>
    </div>
  );
}
