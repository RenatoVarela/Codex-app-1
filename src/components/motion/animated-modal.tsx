"use client";

import { useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/src/lib/utils/cn";
import { useReducedMotion } from "@/src/hooks/use-reduced-motion";

type AnimatedModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

export function AnimatedModal({
  isOpen,
  onClose,
  children,
  className,
}: AnimatedModalProps) {
  const isReduced = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const duration = isReduced ? 0 : 0.4;

  // Focus trap and keyboard handling
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab" && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", handleKeyDown);

      // Focus the content container after animation starts
      requestAnimationFrame(() => {
        contentRef.current?.focus();
      });

      return () => document.removeEventListener("keydown", handleKeyDown);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Content — book-opening scaleY effect */}
          <motion.div
            ref={contentRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg outline-none",
              className
            )}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration, ease: EASE }}
            style={{ transformOrigin: "top" }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
