"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

import { cn } from "@/src/lib/utils/cn";
import { useReducedMotion } from "@/src/hooks/use-reduced-motion";

type Direction = "up" | "down" | "left" | "right";

type StaggerChildrenProps = {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  triggerOnView?: boolean;
  direction?: Direction;
};

const DIRECTION_OFFSETS: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 20 },
  down: { y: -20 },
  left: { x: 20 },
  right: { x: -20 },
};

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.05,
  triggerOnView = true,
}: StaggerChildrenProps) {
  const isReduced = useReducedMotion();

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: isReduced ? 1 : 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: isReduced ? 0 : staggerDelay,
        },
      },
    }),
    [staggerDelay, isReduced]
  );

  const triggerProps = triggerOnView
    ? {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, amount: 0.2 },
      }
    : {
        initial: "hidden" as const,
        animate: "visible" as const,
      };

  return (
    <motion.div
      variants={containerVariants}
      {...triggerProps}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: React.ReactNode;
  className?: string;
  layoutId?: string;
  direction?: Direction;
};

export function StaggerItem({
  children,
  className,
  layoutId,
  direction = "up",
}: StaggerItemProps) {
  const isReduced = useReducedMotion();

  const offset = DIRECTION_OFFSETS[direction];

  const itemVariants = useMemo(
    () =>
      isReduced
        ? {
            hidden: { opacity: 1 },
            visible: { opacity: 1 },
          }
        : {
            hidden: { opacity: 0, ...offset },
            visible: {
              opacity: 1,
              x: 0,
              y: 0,
              transition: {
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1] as const,
              },
            },
          },
    [isReduced, offset]
  );

  return (
    <motion.div
      variants={itemVariants}
      layoutId={layoutId}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
