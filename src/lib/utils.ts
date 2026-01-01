import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function clamp (v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function getLocalFileURL (fileId:string) {
  return `/api/v1/files?fid=${fileId}`
}
export function timeAgo(
  timestamp: string | number | Date,
  locale: string = "no" // fallback to Norwegian
): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = (date.getTime() - now.getTime()) / 1000; // negative = past

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const seconds = Math.round(diff);
  const minutes = Math.round(diff / 60);
  const hours = Math.round(diff / 3600);
  const days = Math.round(diff / 86400);
  const months = Math.round(diff / 2592000); // ~30 days
  const years = Math.round(diff / 31536000); // ~365 days

  if (Math.abs(seconds) < 60) return rtf.format(seconds, "second");
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(years, "year");
}
export function timeAgoCompact(
  timestamp: string | number | Date
): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds ago

  const abs = Math.abs(diffSec);

  if (abs < 60) return `${abs}s`;                     // seconds
  if (abs < 3600) return `${Math.floor(abs / 60)} m`;  // minutes
  if (abs < 86400) return `${Math.floor(abs / 3600)} h`; // hours
  if (abs < 2592000) return `${Math.floor(abs / 86400)} d`; // days
  if (abs < 31536000) return `${Math.floor(abs / 2592000)} mo`; // months (~30 days)
  return `${Math.floor(abs / 31536000)}y`;            // years
}

export function formatFileSize(size: bigint) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let n = Number(size);

  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }

  return `${n.toFixed(2)} ${units[i]}`;
}
export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}