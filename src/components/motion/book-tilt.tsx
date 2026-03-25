"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { cn } from "@/src/lib/utils/cn";
import { useReducedMotion } from "@/src/hooks/use-reduced-motion";

type BookTiltProps = {
  children: React.ReactNode;
  className?: string;
  tiltDegree?: number;
  glowColor?: string;
};

export function BookTilt({
  children,
  className,
  tiltDegree = 3,
  glowColor = "hsl(var(--gold) / 0.15)",
}: BookTiltProps) {
  const isReduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  if (isReduced) {
    return (
      <div
        className={cn(
          "transition-colors duration-150",
          isHovered && "border-primary",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        scale: 1.03,
        rotateY: tiltDegree,
        boxShadow: "0 8px 30px rgba(62, 39, 35, 0.2)",
      }}
      whileTap={{ scale: 0.97 }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn("relative will-change-transform", className)}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Gold glow layer */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(ellipse, ${glowColor}, transparent 70%)`,
        }}
      />
      {children}
    </motion.div>
  );
}
