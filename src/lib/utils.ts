import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to title case
export function toTitleCase(str: string) {
	return str.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
