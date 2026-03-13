const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB"] as const;
const FILE_SIZE_BASE = 1024;

const RELATIVE_TIME_THRESHOLDS = [
  { limit: 60, unit: "second", divisor: 1 },
  { limit: 3600, unit: "minute", divisor: 60 },
  { limit: 86400, unit: "hour", divisor: 3600 },
  { limit: 2592000, unit: "day", divisor: 86400 },
  { limit: 31536000, unit: "month", divisor: 2592000 },
] as const;

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", DATE_FORMAT_OPTIONS);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  let unitIndex = 0;
  let size = bytes;

  while (size >= FILE_SIZE_BASE && unitIndex < FILE_SIZE_UNITS.length - 1) {
    size /= FILE_SIZE_BASE;
    unitIndex++;
  }

  const formatted = unitIndex === 0 ? size.toString() : size.toFixed(1);
  return `${formatted} ${FILE_SIZE_UNITS[unitIndex]}`;
}

export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - date.getTime()) / 1000);

  if (diffInSeconds < 0) return "just now";

  for (const { limit, unit, divisor } of RELATIVE_TIME_THRESHOLDS) {
    if (diffInSeconds < limit) {
      const value = Math.floor(diffInSeconds / divisor);
      if (value <= 1 && unit === "second") return "just now";
      return `${value} ${unit}${value !== 1 ? "s" : ""} ago`;
    }
  }

  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}
