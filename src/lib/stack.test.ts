import { describe, it, expect } from 'vitest';
import type { Card, Cadence } from '../types';
import { isDue, buildStack, markPrayed, dueCount } from './stack';

function makeCard(partial: Partial<Card> & { cadence: Cadence }): Card {
  return {
    id: partial.id ?? 'c1',
    type: 'request',
    title: 'Test',
    personIds: [],
    status: 'active',
    createdAt: 0,
    updatedAt: 0,
    prayCount: 0,
    prayLog: [],
    order: 0,
    ...partial,
  };
}

// Local-time fixtures (the engine compares in local time).
const monJun15 = new Date(2026, 5, 15, 9, 0).getTime(); // Mon Jun 15 2026, 9am
const monJun15Evening = new Date(2026, 5, 15, 22, 0).getTime();
const tueJun16 = new Date(2026, 5, 16, 9, 0).getTime();
const satJun20 = new Date(2026, 5, 20, 9, 0).getTime(); // same week (Sun Jun 14 – Sat Jun 20)
const monJun22 = new Date(2026, 5, 22, 9, 0).getTime(); // next week
const julJul15 = new Date(2026, 6, 15, 9, 0).getTime(); // next month

describe('isDue — never prayed', () => {
  it('is due immediately for any real cadence', () => {
    expect(isDue(makeCard({ cadence: { kind: 'daily' } }), monJun15)).toBe(true);
    expect(isDue(makeCard({ cadence: { kind: 'weekly' } }), monJun15)).toBe(true);
    expect(isDue(makeCard({ cadence: { kind: 'monthly' } }), monJun15)).toBe(true);
    expect(isDue(makeCard({ cadence: { kind: 'everyNDays', n: 3 } }), monJun15)).toBe(true);
  });

  it("cadence 'none' is never auto-due", () => {
    expect(isDue(makeCard({ cadence: { kind: 'none' } }), monJun15)).toBe(false);
  });
});

describe('isDue — non-active cards never appear', () => {
  it('archived and answered cards are not due', () => {
    const base = { cadence: { kind: 'daily' } as Cadence };
    expect(isDue(makeCard({ ...base, status: 'archived' }), monJun15)).toBe(false);
    expect(isDue(makeCard({ ...base, status: 'answered' }), monJun15)).toBe(false);
  });
});

describe('isDue — daily (calendar)', () => {
  const card = makeCard({ cadence: { kind: 'daily' }, lastPrayedAt: monJun15 });
  it('not due later the same day', () => {
    expect(isDue(card, monJun15Evening)).toBe(false);
  });
  it('due again the next day', () => {
    expect(isDue(card, tueJun16)).toBe(true);
  });
});

describe('isDue — weekly (calendar)', () => {
  const card = makeCard({ cadence: { kind: 'weekly' }, lastPrayedAt: monJun15 });
  it('not due later the same week', () => {
    expect(isDue(card, satJun20)).toBe(false);
  });
  it('due the next week', () => {
    expect(isDue(card, monJun22)).toBe(true);
  });
});

describe('isDue — monthly (calendar)', () => {
  const card = makeCard({ cadence: { kind: 'monthly' }, lastPrayedAt: monJun15 });
  it('not due later the same month', () => {
    expect(isDue(card, monJun22)).toBe(false);
  });
  it('due the next month', () => {
    expect(isDue(card, julJul15)).toBe(true);
  });
});

describe('isDue — everyNDays (rolling interval)', () => {
  const card = makeCard({ cadence: { kind: 'everyNDays', n: 3 }, lastPrayedAt: monJun15 });
  it('not due before n days', () => {
    expect(isDue(card, tueJun16)).toBe(false);
  });
  it('due after n days', () => {
    const threeDaysLater = monJun15 + 3 * 24 * 60 * 60 * 1000;
    expect(isDue(card, threeDaysLater)).toBe(true);
  });
});

describe('isDue — rolling mode for daily/weekly/monthly', () => {
  it('daily uses a 24h interval, not calendar day', () => {
    // Prayed at 10pm; 14h later is the next calendar day but < 24h elapsed.
    const card = makeCard({ cadence: { kind: 'daily' }, lastPrayedAt: monJun15Evening });
    const fourteenHoursLater = monJun15Evening + 14 * 60 * 60 * 1000;
    expect(isDue(card, fourteenHoursLater, 'rolling')).toBe(false); // < 24h
    expect(isDue(card, fourteenHoursLater, 'calendar')).toBe(true); // crosses midnight
  });
});

describe('markPrayed', () => {
  it('stamps the card immutably and increments stats', () => {
    const card = makeCard({ cadence: { kind: 'daily' } });
    const prayed = markPrayed(card, monJun15);
    expect(card.prayCount).toBe(0); // original untouched
    expect(prayed.prayCount).toBe(1);
    expect(prayed.lastPrayedAt).toBe(monJun15);
    expect(prayed.prayLog).toEqual([monJun15]);
  });

  it('after praying, the card leaves the daily stack until the next day', () => {
    let card = makeCard({ cadence: { kind: 'daily' } });
    expect(isDue(card, monJun15)).toBe(true);
    card = markPrayed(card, monJun15);
    expect(isDue(card, monJun15Evening)).toBe(false);
    expect(isDue(card, tueJun16)).toBe(true);
  });
});

describe('buildStack', () => {
  const a = makeCard({ id: 'a', cadence: { kind: 'daily' }, lastPrayedAt: undefined, order: 2 });
  const b = makeCard({ id: 'b', cadence: { kind: 'daily' }, lastPrayedAt: monJun15 - 5 * 86400000, order: 1 });
  const notDue = makeCard({ id: 'x', cadence: { kind: 'daily' }, lastPrayedAt: monJun15 });
  const noneCard = makeCard({ id: 'n', cadence: { kind: 'none' } });

  it('includes only due cards', () => {
    const stack = buildStack({ cards: [a, b, notDue, noneCard], now: monJun15 });
    expect(stack.map((c) => c.id)).toEqual(['a', 'b']); // never-prayed (a) before older-prayed (b)
  });

  it('filters by category', () => {
    const cat = makeCard({ id: 'cat', cadence: { kind: 'daily' }, categoryId: 'fam' });
    const stack = buildStack({ cards: [a, cat], now: monJun15, filter: { categoryId: 'fam' } });
    expect(stack.map((c) => c.id)).toEqual(['cat']);
  });

  it('filters by person', () => {
    const p = makeCard({ id: 'p', cadence: { kind: 'daily' }, personIds: ['mom'] });
    const stack = buildStack({ cards: [a, p], now: monJun15, filter: { personId: 'mom' } });
    expect(stack.map((c) => c.id)).toEqual(['p']);
  });
});

describe('dueCount', () => {
  it('counts due active cards', () => {
    const cards = [
      makeCard({ id: '1', cadence: { kind: 'daily' } }),
      makeCard({ id: '2', cadence: { kind: 'daily' }, lastPrayedAt: monJun15 }),
      makeCard({ id: '3', cadence: { kind: 'none' } }),
    ];
    expect(dueCount(cards, monJun15)).toBe(1);
  });
});
