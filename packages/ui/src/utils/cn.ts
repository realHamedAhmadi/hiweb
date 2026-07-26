/**
 * Minimal className combiner (no external dependency yet).
 * Filters falsy values so conditional classes stay readable.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
