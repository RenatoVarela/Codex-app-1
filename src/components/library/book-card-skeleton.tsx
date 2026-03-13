import { cn } from "@/src/lib/utils/cn";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded bg-muted/60",
        "bg-[length:200%_100%]",
        "bg-gradient-to-r from-muted/60 via-muted/30 to-muted/60",
        className
      )}
    />
  );
}

export function BookCardSkeleton() {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg",
        "bg-card border border-border",
        "shadow-sm"
      )}
    >
      <div className="flex min-h-[140px]">
        <div className="w-3 shrink-0 rounded-l-lg bg-muted/40" />

        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <Shimmer className="h-5 w-3/4" />
            <Shimmer className="mt-2 h-5 w-1/2" />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

const SKELETON_COUNT = 8;

export function BookShelfSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
