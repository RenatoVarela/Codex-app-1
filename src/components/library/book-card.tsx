"use client";

import Link from "next/link";
import { FileText, Globe, Type } from "lucide-react";

import { BookTilt } from "@/src/components/motion/book-tilt";
import { cn } from "@/src/lib/utils/cn";
import { formatRelativeTime } from "@/src/lib/utils/format";

import type { Document } from "@/src/types/database";

const SPINE_COLORS = [
  "#8B0000",
  "#2E4057",
  "#4A5D23",
  "#8B4513",
  "#4A0E4E",
  "#1B4332",
  "#7B3F00",
  "#2C3E50",
  "#6B3A2A",
  "#3C1414",
] as const;

function getSpineColor(title: string): string {
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return SPINE_COLORS[hash % SPINE_COLORS.length];
}

const FILE_TYPE_CONFIG = {
  pdf: { label: "PDF", icon: FileText },
  md: { label: "Markdown", icon: Type },
  txt: { label: "Text", icon: Type },
  url: { label: "URL", icon: Globe },
} as const;

type BookCardProps = {
  document: Document;
};

export function BookCard({ document }: BookCardProps) {
  const spineColor = getSpineColor(document.title);
  const typeConfig = FILE_TYPE_CONFIG[document.fileType];
  const TypeIcon = typeConfig.icon;

  return (
    <BookTilt>
      <Link
        href={`/document/${document.id}`}
        className={cn(
          "group block overflow-hidden rounded-lg",
          "bg-card border border-border",
          "shadow-sm hover:shadow-md transition-shadow duration-300"
        )}
      >
        <div className="flex min-h-[140px]">
          <div
            className="w-3 shrink-0 rounded-l-lg"
            style={{ backgroundColor: spineColor }}
          />

          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <h3
                className={cn(
                  "font-heading text-base font-semibold leading-snug",
                  "text-foreground line-clamp-2"
                )}
              >
                {document.title}
              </h3>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  "font-ui text-xs text-muted-foreground"
                )}
              >
                <TypeIcon className="h-3 w-3" />
                {typeConfig.label}
                {document.totalChunks > 0 && (
                  <span className="ml-1">
                    · {document.totalChunks} chunks
                  </span>
                )}
              </span>

              <span className="font-ui text-xs text-muted-foreground">
                {formatRelativeTime(new Date(document.createdAt))}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </BookTilt>
  );
}
