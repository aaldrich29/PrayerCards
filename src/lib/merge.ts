import type { AppData, TombstoneMap } from '../types';

/**
 * Multi-device sync merge.
 *
 * Cards, categories, and people merge per-record by id rather than picking one
 * whole document over the other — so a fresh device (or one that's only made a
 * few small edits) never wipes out data made on another device. For each id:
 *   - present on only one side -> kept (union of both sides).
 *   - present on both sides -> whichever has the newer `updatedAt` wins.
 *   - deleted on one side -> removed, unless the surviving copy was edited again
 *     *after* the deletion was recorded (an edit after a delete "undeletes" it).
 *
 * Settings are a single small object with no per-field timestamps, so they stay
 * last-write-wins on the whole object, using each side's overall `updatedAt`.
 */

interface Identified {
  id: string;
  updatedAt: number;
}

function mergeRecords<T extends Identified>(
  local: T[],
  remote: T[],
  localDeleted: TombstoneMap = {},
  remoteDeleted: TombstoneMap = {},
): { records: T[]; deleted: TombstoneMap } {
  const byId = new Map<string, T>();
  for (const item of local) byId.set(item.id, item);
  for (const item of remote) {
    const existing = byId.get(item.id);
    if (!existing || item.updatedAt > existing.updatedAt) byId.set(item.id, item);
  }

  const deleted: TombstoneMap = { ...localDeleted };
  for (const [id, ts] of Object.entries(remoteDeleted)) {
    if (!deleted[id] || ts > deleted[id]) deleted[id] = ts;
  }

  for (const [id, deletedAt] of Object.entries(deleted)) {
    const record = byId.get(id);
    // The deletion wins unless the surviving record was touched again afterward.
    if (record && deletedAt >= record.updatedAt) byId.delete(id);
  }

  return { records: [...byId.values()], deleted };
}

export function mergeAppData(local: AppData, remote: AppData): AppData {
  const cards = mergeRecords(local.cards, remote.cards, local.deletedCardIds, remote.deletedCardIds);
  const categories = mergeRecords(local.categories, remote.categories, local.deletedCategoryIds, remote.deletedCategoryIds);
  const people = mergeRecords(local.people, remote.people, local.deletedPersonIds, remote.deletedPersonIds);

  return {
    version: Math.max(local.version, remote.version),
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
    cards: cards.records,
    categories: categories.records,
    people: people.records,
    deletedCardIds: cards.deleted,
    deletedCategoryIds: categories.deleted,
    deletedPersonIds: people.deleted,
    settings: local.updatedAt >= remote.updatedAt ? local.settings : remote.settings,
  };
}
