"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import { cn } from "@/src/lib/utils/cn";
import { useReducedMotion } from "@/src/hooks/use-reduced-motion";

type ParallaxProps = {
  children: React.ReactNode;
  speed?: number;
  className?: string;
};

export function Parallax({
  children,
  speed = 0.3,
  className,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `${speed * 100}%`]
  );

  return (
    <motion.div
      ref={ref}
      style={isReduced ? undefined : { y }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
