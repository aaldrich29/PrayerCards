import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppData, Card, Cadence, CardType, Category, Person, Settings } from '../types';
import { SCHEMA_VERSION } from '../types';
import { newId } from '../lib/ids';
import { markPrayed } from '../lib/stack';

export interface NewCardInput {
  type: CardType;
  title: string;
  body?: string;
  notes?: string;
  verseRef?: string;
  categoryId?: string;
  personIds?: string[];
  cadence: Cadence;
}

interface StoreState extends AppData {
  hasSeeded: boolean;

  // Snapshot / replace (used by Drive sync and export/import).
  getData: () => AppData;
  replaceData: (data: AppData) => void;

  // Cards
  addCard: (input: NewCardInput) => Card;
  /** Bulk-create cards (e.g. deploying a preset stack). */
  addCards: (inputs: NewCardInput[]) => void;
  updateCard: (id: string, patch: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  prayForCard: (id: string, now?: number) => void;
  archiveCard: (id: string) => void;
  unarchiveCard: (id: string) => void;
  markAnswered: (id: string, note?: string) => void;
  reopenCard: (id: string) => void;

  // Bulk operations (Manage Cards)
  bulkArchive: (ids: string[]) => void;
  bulkMarkAnswered: (ids: string[], note?: string) => void;
  bulkSetCategory: (ids: string[], categoryId?: string) => void;
  bulkSetCadence: (ids: string[], cadence: Cadence) => void;
  bulkDelete: (ids: string[]) => void;
  /** Set order = position for the given ids (used by drag-to-reorder within a group). */
  reorderCards: (orderedIds: string[]) => void;

  // Categories
  addCategory: (name: string, color: string, defaultCadence?: Cadence) => Category;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // People
  addPerson: (name: string) => Person;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  deletePerson: (id: string) => void;

  // Settings
  updateSettings: (patch: Partial<Settings>) => void;

  seedWelcomeCard: () => void;
}

function nextOrder(cards: Card[]): number {
  return cards.reduce((max, c) => Math.max(max, c.order), 0) + 1;
}

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => {
      /** Apply a data mutation and bump updatedAt for sync. */
      const mutate = (fn: (data: AppData) => Partial<AppData>) => {
        set((state) => ({ ...fn(state), updatedAt: Date.now() }));
      };

      return {
        version: SCHEMA_VERSION,
        updatedAt: Date.now(),
        cards: [],
        categories: [],
        people: [],
        deletedCardIds: {},
        deletedCategoryIds: {},
        deletedPersonIds: {},
        settings: { cadenceMode: 'calendar', theme: 'sepia', shuffleStack: true },
        hasSeeded: false,

        getData: () => {
          const s = get();
          return {
            version: s.version,
            updatedAt: s.updatedAt,
            cards: s.cards,
            categories: s.categories,
            people: s.people,
            deletedCardIds: s.deletedCardIds,
            deletedCategoryIds: s.deletedCategoryIds,
            deletedPersonIds: s.deletedPersonIds,
            settings: s.settings,
          };
        },

        replaceData: (data) =>
          set({
            version: data.version,
            updatedAt: data.updatedAt,
            cards: data.cards,
            categories: data.categories,
            people: data.people,
            deletedCardIds: data.deletedCardIds ?? {},
            deletedCategoryIds: data.deletedCategoryIds ?? {},
            deletedPersonIds: data.deletedPersonIds ?? {},
            settings: data.settings,
          }),

        addCard: (input) => {
          const now = Date.now();
          const card: Card = {
            id: newId(),
            type: input.type,
            title: input.title.trim(),
            body: input.body?.trim() || undefined,
            notes: input.notes?.trim() || undefined,
            verseRef: input.verseRef?.trim() || undefined,
            categoryId: input.categoryId,
            personIds: input.personIds ?? [],
            cadence: input.cadence,
            status: 'active',
            createdAt: now,
            updatedAt: now,
            prayCount: 0,
            prayLog: [],
            order: nextOrder(get().cards),
          };
          mutate((d) => ({ cards: [...d.cards, card] }));
          return card;
        },

        addCards: (inputs) =>
          mutate((d) => {
            let order = nextOrder(d.cards);
            const now = Date.now();
            const created: Card[] = inputs.map((input) => ({
              id: newId(),
              type: input.type,
              title: input.title.trim(),
              body: input.body?.trim() || undefined,
              notes: input.notes?.trim() || undefined,
              verseRef: input.verseRef?.trim() || undefined,
              categoryId: input.categoryId,
              personIds: input.personIds ?? [],
              cadence: input.cadence,
              status: 'active',
              createdAt: now,
              updatedAt: now,
              prayCount: 0,
              prayLog: [],
              order: order++,
            }));
            return { cards: [...d.cards, ...created] };
          }),

        updateCard: (id, patch) =>
          mutate((d) => ({
            cards: d.cards.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)),
          })),

        deleteCard: (id) =>
          mutate((d) => ({
            cards: d.cards.filter((c) => c.id !== id),
            deletedCardIds: { ...d.deletedCardIds, [id]: Date.now() },
          })),

        prayForCard: (id, now = Date.now()) =>
          mutate((d) => ({
            cards: d.cards.map((c) => (c.id === id ? markPrayed(c, now) : c)),
          })),

        archiveCard: (id) =>
          mutate((d) => ({
            cards: d.cards.map((c) => (c.id === id ? { ...c, status: 'archived', updatedAt: Date.now() } : c)),
          })),

        unarchiveCard: (id) =>
          mutate((d) => ({
            cards: d.cards.map((c) => (c.id === id ? { ...c, status: 'active', updatedAt: Date.now() } : c)),
          })),

        markAnswered: (id, note) =>
          mutate((d) => ({
            cards: d.cards.map((c) =>
              c.id === id
                ? {
                    ...c,
                    status: 'answered',
                    answeredAt: Date.now(),
                    answeredNote: note?.trim() || undefined,
                    updatedAt: Date.now(),
                  }
                : c,
            ),
          })),

        reopenCard: (id) =>
          mutate((d) => ({
            cards: d.cards.map((c) =>
              c.id === id
                ? { ...c, status: 'active', answeredAt: undefined, answeredNote: undefined, updatedAt: Date.now() }
                : c,
            ),
          })),

        bulkArchive: (ids) => {
          const set = new Set(ids);
          const now = Date.now();
          mutate((d) => ({
            cards: d.cards.map((c) => (set.has(c.id) ? { ...c, status: 'archived', updatedAt: now } : c)),
          }));
        },

        bulkMarkAnswered: (ids, note) => {
          const set = new Set(ids);
          const now = Date.now();
          mutate((d) => ({
            cards: d.cards.map((c) =>
              set.has(c.id)
                ? { ...c, status: 'answered', answeredAt: now, answeredNote: note?.trim() || c.answeredNote, updatedAt: now }
                : c,
            ),
          }));
        },

        bulkSetCategory: (ids, categoryId) => {
          const set = new Set(ids);
          const now = Date.now();
          mutate((d) => ({ cards: d.cards.map((c) => (set.has(c.id) ? { ...c, categoryId, updatedAt: now } : c)) }));
        },

        bulkSetCadence: (ids, cadence) => {
          const set = new Set(ids);
          const now = Date.now();
          mutate((d) => ({ cards: d.cards.map((c) => (set.has(c.id) ? { ...c, cadence, updatedAt: now } : c)) }));
        },

        bulkDelete: (ids) => {
          const set = new Set(ids);
          const now = Date.now();
          mutate((d) => {
            const deletedCardIds = { ...d.deletedCardIds };
            for (const id of ids) deletedCardIds[id] = now;
            return { cards: d.cards.filter((c) => !set.has(c.id)), deletedCardIds };
          });
        },

        reorderCards: (orderedIds) => {
          const orderById = new Map(orderedIds.map((id, i) => [id, i]));
          const now = Date.now();
          mutate((d) => ({
            cards: d.cards.map((c) => (orderById.has(c.id) ? { ...c, order: orderById.get(c.id)!, updatedAt: now } : c)),
          }));
        },

        addCategory: (name, color, defaultCadence) => {
          const cat: Category = { id: newId(), name: name.trim(), color, defaultCadence, updatedAt: Date.now() };
          mutate((d) => ({ categories: [...d.categories, cat] }));
          return cat;
        },

        updateCategory: (id, patch) =>
          mutate((d) => ({
            categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)),
          })),

        deleteCategory: (id) => {
          const now = Date.now();
          mutate((d) => ({
            categories: d.categories.filter((c) => c.id !== id),
            // Detach cards from the deleted category rather than deleting them.
            cards: d.cards.map((c) => (c.categoryId === id ? { ...c, categoryId: undefined, updatedAt: now } : c)),
            deletedCategoryIds: { ...d.deletedCategoryIds, [id]: now },
          }));
        },

        addPerson: (name) => {
          const person: Person = { id: newId(), name: name.trim(), updatedAt: Date.now() };
          mutate((d) => ({ people: [...d.people, person] }));
          return person;
        },

        updatePerson: (id, patch) =>
          mutate((d) => ({
            people: d.people.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
          })),

        deletePerson: (id) => {
          const now = Date.now();
          mutate((d) => ({
            people: d.people.filter((p) => p.id !== id),
            cards: d.cards.map((c) =>
              c.personIds.includes(id)
                ? { ...c, personIds: c.personIds.filter((pid) => pid !== id), updatedAt: now }
                : c,
            ),
            deletedPersonIds: { ...d.deletedPersonIds, [id]: now },
          }));
        },

        updateSettings: (patch) => mutate((d) => ({ settings: { ...d.settings, ...patch } })),

        seedWelcomeCard: () => {
          if (get().hasSeeded) return;
          const now = Date.now();
          // Fixed id (not newId()) so that if multiple fresh devices each seed this
          // before ever linking Drive sync, merging them later collapses into one
          // card instead of piling up a duplicate "Welcome" card per device.
          const card: Card = {
            id: 'welcome-card',
            type: 'request',
            title: 'Welcome to Prayer Cards 🙏',
            body: 'Tap the + button below to add your first prayer request or verse. Or head to Settings → Prayer card sets to deploy a ready-made set — Names of God, a guided TACOS rhythm, prayers for your spouse, children, and more.\n\nWhen you’re ready, flip this card and tap Archive to put it away for good.',
            personIds: [],
            cadence: { kind: 'daily' },
            status: 'active',
            createdAt: now,
            updatedAt: now,
            prayCount: 0,
            prayLog: [],
            order: 0,
          };
          set((state) => ({ cards: [...state.cards, card], hasSeeded: true, updatedAt: now }));
        },
      };
    },
    {
      name: 'prayer-cards',
      version: SCHEMA_VERSION,
      partialize: (s) => ({
        version: s.version,
        updatedAt: s.updatedAt,
        cards: s.cards,
        categories: s.categories,
        people: s.people,
        deletedCardIds: s.deletedCardIds,
        deletedCategoryIds: s.deletedCategoryIds,
        deletedPersonIds: s.deletedPersonIds,
        settings: s.settings,
        hasSeeded: s.hasSeeded,
      }),
      // Backfill records saved before `updatedAt`/tombstone maps existed, so sync
      // merge always has a real number to compare rather than `undefined`.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StoreState>;
        return {
          ...current,
          ...p,
          cards: (p.cards ?? []).map((c) => ({ ...c, updatedAt: c.updatedAt ?? c.createdAt ?? Date.now() })),
          categories: (p.categories ?? []).map((c) => ({ ...c, updatedAt: c.updatedAt ?? Date.now() })),
          people: (p.people ?? []).map((person) => ({ ...person, updatedAt: person.updatedAt ?? Date.now() })),
          deletedCardIds: p.deletedCardIds ?? {},
          deletedCategoryIds: p.deletedCategoryIds ?? {},
          deletedPersonIds: p.deletedPersonIds ?? {},
        };
      },
    },
  ),
);
