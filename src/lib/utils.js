import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const isBrowser = typeof window !== "undefined";

export function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.round(value)));
}
