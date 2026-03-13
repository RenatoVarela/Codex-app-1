import { Calendar, FileText, Globe, Loader2, Type, AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/src/lib/utils/cn";
import { formatDate } from "@/src/lib/utils/format";

import type { Document, DocumentStatus, FileType } from "@/src/types/database";

const FILE_TYPE_LABELS: Record<FileType, { label: string; icon: typeof FileText }> = {
  pdf: { label: "PDF", icon: FileText },
  md: { label: "Markdown", icon: Type },
  txt: { label: "Text", icon: Type },
  url: { label: "URL", icon: Globe },
};

const STATUS_CONFIG: Record<DocumentStatus, { label: string; icon: typeof Loader2; className: string }> = {
  processing: {
    label: "Processing",
    icon: Loader2,
    className: "text-primary",
  },
  ready: {
    label: "Ready",
    icon: CheckCircle2,
    className: "text-ink-green",
  },
  error: {
    label: "Error",
    icon: AlertCircle,
    className: "text-destructive",
  },
};

type DocumentViewerProps = {
  document: Document;
};

export function DocumentViewer({ document }: DocumentViewerProps) {
  const typeConfig = FILE_TYPE_LABELS[document.fileType];
  const statusConfig = STATUS_CONFIG[document.status];
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        {document.title}
      </h1>

      <div className="mt-4 flex flex-wrap gap-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            "rounded-md bg-accent px-2.5 py-1",
            "font-ui text-xs font-medium text-accent-foreground"
          )}
        >
          <TypeIcon className="h-3.5 w-3.5" />
          {typeConfig.label}
        </span>

        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            "rounded-md bg-accent px-2.5 py-1",
            "font-ui text-xs font-medium",
            statusConfig.className
          )}
        >
          <StatusIcon
            className={cn(
              "h-3.5 w-3.5",
              document.status === "processing" && "animate-spin"
            )}
          />
          {statusConfig.label}
        </span>

        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            "font-ui text-xs text-muted-foreground"
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(new Date(document.createdAt))}
        </span>

        {document.totalChunks > 0 && (
          <span className="font-ui text-xs text-muted-foreground">
            {document.totalChunks} chunks indexed
          </span>
        )}
      </div>
    </div>
  );
}
