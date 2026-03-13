import { BookOpen } from "lucide-react";

import { cn } from "@/src/lib/utils/cn";

type EmptyLibraryProps = {
  onUploadClick?: () => void;
};

export function EmptyLibrary({ onUploadClick }: EmptyLibraryProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        "rounded-lg border border-dashed border-border bg-card/50"
      )}
    >
      <BookOpen className="h-16 w-16 text-muted-foreground/50" />

      <h2 className="mt-6 font-heading text-2xl font-semibold text-foreground">
        Your library is empty
      </h2>

      <p className="mt-2 max-w-md font-body text-muted-foreground">
        Upload your first document to begin building your personal knowledge
        base
      </p>

      {onUploadClick && (
        <button
          onClick={onUploadClick}
          className={cn(
            "mt-6 rounded-md px-6 py-2.5",
            "bg-primary text-primary-foreground",
            "font-ui text-sm font-medium",
            "hover:opacity-90 transition-opacity",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          Upload a Document
        </button>
      )}
    </div>
  );
}
