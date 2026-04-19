"use client";

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,10,0.88)" }}
    >
      <div
        className="w-full p-5 flex flex-col gap-4"
        style={{
          maxWidth: 340,
          background: "#06061e",
          border: "1px solid #ef444455",
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        <p className="text-[13px] leading-relaxed" style={{ color: "#c8c8ff" }}>{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 text-[12px] transition-opacity hover:opacity-80"
            style={{
              background: "#3a0a0a",
              border: "1px solid #ef4444",
              color: "#ef4444",
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            确认删除
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-[12px] transition-opacity hover:opacity-80"
            style={{
              border: "1px solid #2a2a6a",
              color: "#6a6aaa",
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
