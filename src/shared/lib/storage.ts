import type { z } from 'zod';

export function readStorage<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const result = schema.safeParse(JSON.parse(raw));
    if (result.success) return result.data;
    console.warn(`Invalid saved preference (${key}); using defaults.`);
  } catch (error) {
    console.warn(`Could not read saved preference (${key}); using defaults.`, error);
  }
  return fallback;
}
export function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Could not save preference (${key}).`, error);
  }
}
