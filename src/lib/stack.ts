import type { Card, CadenceMode } from '../types';
import { DAY_MS, isSameDay, isSameWeek, isSameMonth } from './dates';

/**
 * The stack engine — the heart of the app.
 *
 * A card is "due" (belongs in the prayer stack) when its cadence period has
 * elapsed since it was last prayed for. Praying for it (markPrayed) stamps it
 * and it leaves the stack until the next period.
 *
 * These functions are pure so they can be unit-tested and reused freely.
 */

/**
 * Whether an active card is currently due to be prayed over.
 *
 * In 'calendar' mode, daily/weekly/monthly reset at calendar boundaries
 * (a card prayed today won't return until tomorrow / next week / next month).
 * In 'rolling' mode, the same cadences behave as fixed 1/7/30-day intervals
 * measured from the last time it was prayed.
 */
export function isDue(card: Card, now: number, mode: CadenceMode = 'calendar'): boolean {
  if (card.status !== 'active') return false;
  if (card.cadence.kind === 'none') return false;

  // Never prayed for yet: it's due as soon as it exists.
  if (card.lastPrayedAt == null) return true;

  const last = card.lastPrayedAt;

  switch (card.cadence.kind) {
    case 'daily':
      return mode === 'calendar' ? !isSameDay(last, now) : now - last >= DAY_MS;
    case 'weekly':
      return mode === 'calendar' ? !isSameWeek(last, now) : now - last >= 7 * DAY_MS;
    case 'monthly':
      return mode === 'calendar' ? !isSameMonth(last, now) : now - last >= 30 * DAY_MS;
    case 'everyNDays':
      return now - last >= card.cadence.n * DAY_MS;
  }
}

export interface StackFilter {
  categoryId?: string;
  personId?: string;
}

export interface BuildStackArgs {
  cards: Card[];
  now: number;
  mode?: CadenceMode;
  filter?: StackFilter;
}

/**
 * Build the ordered list of due cards for the prayer session.
 * Order: cards not prayed in the longest (or never) come first, then manual `order`.
 */
export function buildStack({ cards, now, mode = 'calendar', filter }: BuildStackArgs): Card[] {
  return cards
    .filter((c) => isDue(c, now, mode))
    .filter((c) => (filter?.categoryId ? c.categoryId === filter.categoryId : true))
    .filter((c) => (filter?.personId ? c.personIds.includes(filter.personId) : true))
    .sort((a, b) => {
      const aLast = a.lastPrayedAt ?? 0;
      const bLast = b.lastPrayedAt ?? 0;
      if (aLast !== bLast) return aLast - bLast; // oldest / never-prayed first
      return a.order - b.order;
    });
}

/** Return a new card object marked as prayed-for at `now` (immutably). */
export function markPrayed(card: Card, now: number): Card {
  return {
    ...card,
    lastPrayedAt: now,
    prayCount: card.prayCount + 1,
    prayLog: [...card.prayLog, now],
  };
}

/** Count of currently-due active cards (for the badge / "due today"). */
export function dueCount(cards: Card[], now: number, mode: CadenceMode = 'calendar'): number {
  let n = 0;
  for (const c of cards) if (isDue(c, now, mode)) n++;
  return n;
}
