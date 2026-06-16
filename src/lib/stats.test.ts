import { describe, it, expect } from 'vitest';
import type { Card } from '../types';
import { totalPrayers, prayersByDay, currentStreak, activeDays, topCards } from './stats';

const DAY = 86400000;

function makeCard(id: string, prayLog: number[]): Card {
  return {
    id,
    type: 'request',
    title: id,
    personIds: [],
    cadence: { kind: 'daily' },
    status: 'active',
    createdAt: 0,
    prayCount: prayLog.length,
    prayLog,
    order: 0,
  };
}

// Anchor "now" at a fixed local noon for determinism.
const now = new Date(2026, 5, 15, 12, 0).getTime();
const startToday = new Date(2026, 5, 15, 0, 0).getTime();
const day = (offset: number, hour = 9) => new Date(2026, 5, 15 + offset, hour).getTime();

describe('totalPrayers', () => {
  it('sums prayLog lengths across cards', () => {
    expect(totalPrayers([makeCard('a', [1, 2, 3]), makeCard('b', [4])])).toBe(4);
    expect(totalPrayers([])).toBe(0);
  });
});

describe('prayersByDay', () => {
  it('returns one bucket per day, oldest first, counting events in range', () => {
    const cards = [makeCard('a', [day(0), day(0), day(-1)]), makeCard('b', [day(-6)])];
    const result = prayersByDay(cards, 7, now);
    expect(result).toHaveLength(7);
    expect(result[0].day).toBe(startToday - 6 * DAY);
    expect(result[6].day).toBe(startToday);
    expect(result[6].count).toBe(2); // two today
    expect(result[5].count).toBe(1); // one yesterday
    expect(result[0].count).toBe(1); // one six days ago
  });

  it('ignores events outside the window', () => {
    const cards = [makeCard('a', [day(-30)])];
    const result = prayersByDay(cards, 7, now);
    expect(result.reduce((n, d) => n + d.count, 0)).toBe(0);
  });
});

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    const cards = [makeCard('a', [day(0), day(-1), day(-2)])];
    expect(currentStreak(cards, now)).toBe(3);
  });

  it('gives grace if nothing prayed today yet', () => {
    const cards = [makeCard('a', [day(-1), day(-2)])];
    expect(currentStreak(cards, now)).toBe(2);
  });

  it('breaks when a day is missed', () => {
    const cards = [makeCard('a', [day(0), day(-2), day(-3)])];
    expect(currentStreak(cards, now)).toBe(1);
  });

  it('is 0 with no history', () => {
    expect(currentStreak([makeCard('a', [])], now)).toBe(0);
  });
});

describe('activeDays', () => {
  it('counts distinct prayer days', () => {
    const cards = [makeCard('a', [day(0), day(0), day(-1)]), makeCard('b', [day(-1)])];
    expect(activeDays(cards)).toBe(2);
  });
});

describe('topCards', () => {
  it('ranks by prayLog length and excludes never-prayed', () => {
    const cards = [makeCard('a', [1]), makeCard('b', [1, 2, 3]), makeCard('c', [])];
    const top = topCards(cards, 5);
    expect(top.map((c) => c.id)).toEqual(['b', 'a']);
  });
});
