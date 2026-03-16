"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

type StreamingTextProps = {
  content: string;
  isStreaming?: boolean;
};

export function StreamingText({ content, isStreaming = false }: StreamingTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayedLength, setDisplayedLength] = useState(0);
  const prevContentLength = useRef(0);

  useEffect(() => {
    // If reduced motion or not streaming, show all content immediately
    if (prefersReducedMotion || !isStreaming) {
      setDisplayedLength(content.length);
      prevContentLength.current = content.length;
      return;
    }

    // Animate new characters as they arrive during streaming
    if (content.length > prevContentLength.current) {
      const newChars = content.length - displayedLength;
      if (newChars <= 0) {
        prevContentLength.current = content.length;
        return;
      }

      let currentIndex = displayedLength;
      const interval = setInterval(() => {
        currentIndex += 2; // Reveal 2 chars at a time for smoother feel
        if (currentIndex >= content.length) {
          currentIndex = content.length;
          clearInterval(interval);
        }
        setDisplayedLength(currentIndex);
      }, 10);

      prevContentLength.current = content.length;
      return () => clearInterval(interval);
    }

    prevContentLength.current = content.length;
  }, [content, isStreaming, prefersReducedMotion, displayedLength]);

  // Reset when content changes completely (new message)
  useEffect(() => {
    if (content.length < displayedLength) {
      setDisplayedLength(0);
      prevContentLength.current = 0;
    }
  }, [content, displayedLength]);

  const visibleContent = content.slice(0, displayedLength);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="font-body text-base leading-relaxed whitespace-pre-wrap"
    >
      {visibleContent}
      {isStreaming && displayedLength < content.length && (
        <span className="inline-block h-4 w-1 animate-pulse bg-foreground/60" />
      )}
    </motion.div>
  );
}
