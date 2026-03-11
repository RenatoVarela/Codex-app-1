import { cn } from "@/src/lib/utils/cn";

type BookSpineProps = {
  title: string;
  color: string;
};

export function BookSpine({ title, color }: BookSpineProps) {
  return (
    <div
      className={cn(
        "flex h-32 w-10 items-center justify-center",
        "rounded-sm shadow-sm",
        "overflow-hidden"
      )}
      style={{ backgroundColor: color }}
    >
      <span
        className={cn(
          "font-heading text-[10px] font-semibold leading-tight",
          "text-white/90 [writing-mode:vertical-rl]",
          "rotate-180 truncate px-1"
        )}
      >
        {title}
      </span>
    </div>
  );
}
