"use client";

import { AlertCircle } from "lucide-react";

import { BookShelf } from "@/src/components/library/book-shelf";
import { BookShelfSkeleton } from "@/src/components/library/book-card-skeleton";
import { EmptyLibrary } from "@/src/components/library/empty-library";
import { UploadZone } from "@/src/components/library/upload-zone";
import { Parallax } from "@/src/components/motion/parallax";
import { useDocuments } from "@/src/hooks/queries/use-documents";
import { useUpload } from "@/src/hooks/use-upload";
import { cn } from "@/src/lib/utils/cn";

export default function LibraryPage() {
  const { documents, isLoading, error, refetch } = useDocuments();
  const { uploadFile, uploadUrl, isUploading, progress } = useUpload();

  return (
    <div className="space-y-8">
      <Parallax speed={0.3}>
        <div className="flex items-baseline justify-between">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            My Library
          </h1>
          {documents.length > 0 && (
            <span className="font-ui text-sm text-muted-foreground">
              {documents.length} {documents.length === 1 ? "tome" : "tomes"}
            </span>
          )}
        </div>
      </Parallax>

      <UploadZone
        onUpload={uploadFile}
        onUrlSubmit={uploadUrl}
        isUploading={isUploading}
        progress={progress}
      />

      {isLoading ? (
        <BookShelfSkeleton />
      ) : error ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center py-12 text-center",
            "rounded-lg border border-border bg-card"
          )}
        >
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="mt-3 font-body text-sm text-foreground">
            Failed to load your documents
          </p>
          <button
            onClick={() => refetch()}
            className={cn(
              "mt-4 rounded-md px-4 py-2",
              "bg-primary text-primary-foreground",
              "font-ui text-sm font-medium",
              "hover:opacity-90 transition-opacity"
            )}
          >
            Try Again
          </button>
        </div>
      ) : documents.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <BookShelf documents={documents} />
      )}
    </div>
  );
}
