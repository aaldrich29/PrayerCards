import type { Cadence } from '../types';

export const CADENCE_PRESETS: { label: string; value: Cadence }[] = [
  { label: 'Daily', value: { kind: 'daily' } },
  { label: 'Weekly', value: { kind: 'weekly' } },
  { label: 'Monthly', value: { kind: 'monthly' } },
  { label: 'Every 3 days', value: { kind: 'everyNDays', n: 3 } },
  { label: 'No schedule', value: { kind: 'none' } },
];

export function cadenceLabel(c: Cadence): string {
  switch (c.kind) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'everyNDays':
      return c.n === 1 ? 'Daily' : `Every ${c.n} days`;
    case 'none':
      return 'No schedule';
  }
}

/** Stable string key for a cadence, used to match a preset in a <select>. */
export function cadenceKey(c: Cadence): string {
  return c.kind === 'everyNDays' ? `everyNDays:${c.n}` : c.kind;
}

export function cadenceFromKey(key: string): Cadence {
  if (key.startsWith('everyNDays:')) {
    const n = Number(key.split(':')[1]) || 3;
    return { kind: 'everyNDays', n };
  }
  return { kind: key as Exclude<Cadence, { kind: 'everyNDays' }>['kind'] };
}
