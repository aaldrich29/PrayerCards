import type { Card } from '../types';
import { DAY_MS, startOfDay } from './dates';

/**
 * Prayer-tracking aggregations over time, derived from each card's `prayLog`
 * (an array of timestamps, one per time it was prayed for). Pure + testable.
 */

export interface DayCount {
  day: number; // startOfDay epoch ms
  count: number;
}

/** Total number of times anything has been prayed for, across all cards. */
export function totalPrayers(cards: Card[]): number {
  return cards.reduce((n, c) => n + c.prayLog.length, 0)
}

/** Prayer counts per day for the last `days` days, oldest → newest. */
export function prayersByDay(cards: Card[], days: number, now: number = Date.now()): DayCount[] {
  const today = startOfDay(now);
  const buckets = new Map<number, number>();
  for (let i = days - 1; i >= 0; i--) buckets.set(today - i * DAY_MS, 0);
  for (const c of cards) {
    for (const t of c.prayLog) {
      const d = startOfDay(t);
      if (buckets.has(d)) buckets.set(d, (buckets.get(d) ?? 0) + 1);
    }
  }
  return [...buckets.entries()].map(([day, count]) => ({ day, count })).sort((a, b) => a.day - b.day);
}

/**
 * Number of consecutive days (ending today) on which at least one prayer was
 * recorded. If nothing was prayed today yet, the streak is measured up to
 * yesterday so it isn't considered "broken" until a full day passes.
 */
export function currentStreak(cards: Card[], now: number = Date.now()): number {
  const daysWith = new Set<number>();
  for (const c of cards) for (const t of c.prayLog) daysWith.add(startOfDay(t));
  if (daysWith.size === 0) return 0;

  let day = startOfDay(now);
  if (!daysWith.has(day)) day -= DAY_MS; // grace for "haven't prayed yet today"

  let streak = 0;
  while (daysWith.has(day)) {
    streak++;
    day -= DAY_MS;
  }
  return streak;
}

/** Number of distinct days with at least one prayer. */
export function activeDays(cards: Card[]): number {
  const days = new Set<number>();
  for (const c of cards) for (const t of c.prayLog) days.add(startOfDay(t));
  return days.size;
}

/** Cards with the most prayers, descending. Only cards prayed at least once. */
export function topCards(cards: Card[], n: number = 5): Card[] {
  return [...cards]
    .filter((c) => c.prayLog.length > 0)
    .sort((a, b) => b.prayLog.length - a.prayLog.length)
    .slice(0, n);
}
