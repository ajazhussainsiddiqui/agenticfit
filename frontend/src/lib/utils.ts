import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(err: any, fallback = 'An error occurred'): string {
  if (err?.response?.data?.detail) {
    const detail = err.response.data.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((e: any) => `${e.loc?.join('.') || 'Field'}: ${e.msg}`).join(', ');
    }
  }
  if (err?.response?.data?.message) {
    if (typeof err.response.data.message === 'string') return err.response.data.message;
  }
  if (err?.message) {
    return err.message;
  }
  return fallback;
}
