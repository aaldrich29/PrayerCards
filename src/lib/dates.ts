/**
 * Calendar-boundary helpers used by the stack engine and UI.
 * All comparisons use the runtime's local timezone, which is what a user
 * intuitively means by "today" / "this week" / "this month".
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

/** 0 = Sunday. Church/US convention; change here to shift the week boundary. */
export const WEEK_STARTS_ON = 0;

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function isSameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}

/** Start of the calendar week containing `ts` (local time). */
export function startOfWeek(ts: number, weekStartsOn: number = WEEK_STARTS_ON): number {
  const d = new Date(startOfDay(ts));
  const diff = (d.getDay() - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d.getTime();
}

export function isSameWeek(a: number, b: number, weekStartsOn: number = WEEK_STARTS_ON): boolean {
  return startOfWeek(a, weekStartsOn) === startOfWeek(b, weekStartsOn);
}

export function isSameMonth(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth();
}

/** Short human date, e.g. "Jun 15, 2026". */
export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Relative phrasing for "last prayed" etc., e.g. "today", "3 days ago". */
export function formatRelative(ts: number, now: number = Date.now()): string {
  const days = Math.floor((startOfDay(now) - startOfDay(ts)) / DAY_MS);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return w === 1 ? 'a week ago' : `${w} weeks ago`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30);
    return m === 1 ? 'a month ago' : `${m} months ago`;
  }
  const y = Math.floor(days / 365);
  return y === 1 ? 'a year ago' : `${y} years ago`;
}
