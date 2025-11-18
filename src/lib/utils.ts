import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeParseNum(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const num = +value;

  return isNaN(num) ? undefined : num;
}

export function uppercaseFirstChar(v?: string) {
  if (!v?.[0] || v.length === 1) {
    return v;
  }

  return `${v[0].toUpperCase()}${v.substring(1)}`;
}
