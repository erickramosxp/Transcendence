import React, { useEffect } from "react";
import { Button } from "@/design-system/primitives/Button";
import { X } from "lucide-react";

export function Modal({
  open,
  title,
  onClose,
  children,
  size = "md",
  scrollMode = "content",
}) {
  const sizes = {
    sm: "w-full max-w-sm",
    md: "w-full max-w-md sm:max-w-lg",
    lg: "w-full max-w-lg sm:max-w-xl",
    xl: "w-full max-w-xl sm:max-w-2xl",
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const contentClass =
    scrollMode === "content"
      ? "flex-1 min-h-0 overflow-y-auto px-2 pb-24 sm:pb-6"
      : scrollMode === "none"
      ? "flex-1 p-4 sm:p-6 overflow-visible"
      : "flex-1 p-4 sm:p-6";

  const dialogClass =
    scrollMode === "dialog"
      ? "max-h-[95vh] overflow-y-auto"
      : "max-h-[95vh] overflow-hidden";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-1 backdrop-blur-sm sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`${sizes[size]} w-full rounded-xl border border-border bg-card text-foreground shadow-2xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col ${dialogClass}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-2 sm:px-4 sm:py-3">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <Button
            size="sm"
            variant="destructive"
            className="cursor-pointer"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className={contentClass}>{children}</div>
      </div>
    </div>
  );
}