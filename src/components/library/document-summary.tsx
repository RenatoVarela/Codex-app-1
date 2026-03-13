import { BookOpen } from "lucide-react";

import { cn } from "@/src/lib/utils/cn";

type DocumentSummaryProps = {
  summary: string | null;
};

export function DocumentSummary({ summary }: DocumentSummaryProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Summary
        </h2>
      </div>

      {summary ? (
        <p className="mt-3 font-body text-sm leading-relaxed text-card-foreground">
          {summary}
        </p>
      ) : (
        <p
          className={cn(
            "mt-3 rounded-md bg-accent/50 p-4",
            "font-body text-sm italic text-muted-foreground"
          )}
        >
          Summary will be generated after processing
        </p>
      )}
    </div>
  );
}
