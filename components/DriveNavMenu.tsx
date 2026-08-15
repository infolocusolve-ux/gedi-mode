"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Music2, RotateCcw, SlidersHorizontal, Route } from "lucide-react";

interface DriveNavMenuProps {
  onChangeMood: () => void;
  onChangeRoute: () => void;
  onStartOver: () => void;
}

export default function DriveNavMenu({
  onChangeMood,
  onChangeRoute,
  onStartOver,
}: DriveNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const runAndClose = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Drive options"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-gedi-offwhite/20 bg-black/40 text-gedi-offwhite/85 backdrop-blur-md transition-colors duration-300 hover:border-gedi-amber hover:text-gedi-amber focus-visible:border-gedi-amber"
      >
        <SlidersHorizontal size={16} strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            aria-label="Drive options"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-[calc(100%+8px)] right-0 z-30 w-48 overflow-hidden rounded-lg border border-white/10 bg-gedi-charcoal/95 shadow-[0_12px_30px_rgba(0,0,0,0.6)] backdrop-blur-md"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => runAndClose(onChangeMood)}
              className="flex w-full min-h-11 items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-gedi-offwhite transition-colors hover:bg-white/5 hover:text-gedi-amber"
            >
              <Music2 size={15} strokeWidth={1.75} aria-hidden="true" />
              Change mood
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => runAndClose(onChangeRoute)}
              className="flex w-full min-h-11 items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-gedi-offwhite transition-colors hover:bg-white/5 hover:text-gedi-amber"
            >
              <Route size={15} strokeWidth={1.75} aria-hidden="true" />
              Change route
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => runAndClose(onStartOver)}
              className="flex w-full min-h-11 items-center gap-2.5 border-t border-white/10 px-4 py-2.5 text-left text-sm font-medium text-gedi-offwhite/80 transition-colors hover:bg-white/5 hover:text-gedi-amber"
            >
              <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" />
              Start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
