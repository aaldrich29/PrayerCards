import { describe, it, expect } from 'vitest';
import { mergeAppData } from './merge';
import { emptyAppData } from '../types';
import type { Card } from '../types';

function card(id: string, updatedAt: number, title = id): Card {
  return {
    id,
    type: 'request',
    title,
    personIds: [],
    cadence: { kind: 'daily' },
    status: 'active',
    createdAt: updatedAt,
    updatedAt,
    prayCount: 0,
    prayLog: [],
    order: 0,
  };
}

describe('mergeAppData', () => {
  it('a fresh empty device never wipes out real data from the other side', () => {
    const freshDevice = emptyAppData(2000); // just installed, nothing added yet
    const realData = emptyAppData(1000); // older overall timestamp, but has real cards
    realData.cards = [card('a', 500), card('b', 600)];

    const merged = mergeAppData(freshDevice, realData);

    expect(merged.cards.map((c) => c.id).sort()).toEqual(['a', 'b']);
  });

  it('unions non-overlapping cards added independently on two devices', () => {
    const local = emptyAppData(1000);
    local.cards = [card('a', 100)];
    const remote = emptyAppData(1000);
    remote.cards = [card('b', 100)];

    const merged = mergeAppData(local, remote);

    expect(merged.cards.map((c) => c.id).sort()).toEqual(['a', 'b']);
  });

  it('the newer edit wins when the same card was changed on both sides', () => {
    const local = emptyAppData(1000);
    local.cards = [card('a', 500, 'local edit')];
    const remote = emptyAppData(1000);
    remote.cards = [card('a', 900, 'remote edit')];

    const merged = mergeAppData(local, remote);

    expect(merged.cards).toHaveLength(1);
    expect(merged.cards[0].title).toBe('remote edit');
  });

  it('a deletion removes the card from the merged result', () => {
    const local = emptyAppData(1000);
    local.cards = [];
    local.deletedCardIds = { a: 900 }; // deleted locally after the remote's last edit
    const remote = emptyAppData(1000);
    remote.cards = [card('a', 500)];

    const merged = mergeAppData(local, remote);

    expect(merged.cards).toHaveLength(0);
    expect(merged.deletedCardIds.a).toBe(900);
  });

  it('an edit after a delete resurrects the record (newer edit beats older tombstone)', () => {
    const local = emptyAppData(1000);
    local.cards = [];
    local.deletedCardIds = { a: 500 }; // deleted locally at t=500
    const remote = emptyAppData(1000);
    remote.cards = [card('a', 900)]; // edited on another device at t=900, after the delete

    const merged = mergeAppData(local, remote);

    expect(merged.cards.map((c) => c.id)).toEqual(['a']);
  });

  it('settings follow whichever side has the newer overall updatedAt', () => {
    const local = emptyAppData(2000);
    local.settings.theme = 'sepia';
    const remote = emptyAppData(1000);
    remote.settings.theme = 'paper';

    const merged = mergeAppData(local, remote);

    expect(merged.settings.theme).toBe('sepia');
  });
});
