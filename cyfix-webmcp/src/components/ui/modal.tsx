"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          // Full-width sheet anchored to the bottom on a phone; a centred
          // dialog once there is room for one.
          "relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-y-auto rounded-t-2xl border border-graphite-600 bg-graphite-900 shadow-2xl sm:max-h-[85vh] sm:rounded-xl",
          className,
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-graphite-700 bg-graphite-900 px-4 py-3.5 sm:px-6 sm:py-4">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-m-1 shrink-0 rounded-md p-2.5 text-graphite-500 hover:bg-graphite-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-w-0 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
