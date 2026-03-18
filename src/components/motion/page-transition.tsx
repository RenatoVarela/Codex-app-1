"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import { useReducedMotion } from "@/src/hooks/use-reduced-motion";

type PageTransitionProps = {
  children: React.ReactNode;
};

const EASE = [0.16, 1, 0.3, 1] as const;

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const isReduced = useReducedMotion();

  const duration = isReduced ? 0 : 0.3;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
