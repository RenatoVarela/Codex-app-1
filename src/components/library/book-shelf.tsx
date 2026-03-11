"use client";

import { BookCard } from "@/src/components/library/book-card";
import { StaggerChildren, StaggerItem } from "@/src/components/motion/stagger-children";

import type { Document } from "@/src/types/database";

type BookShelfProps = {
  documents: Document[];
};

export function BookShelf({ documents }: BookShelfProps) {
  return (
    <StaggerChildren
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {documents.map((doc) => (
        <StaggerItem key={doc.id}>
          <BookCard document={doc} />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
