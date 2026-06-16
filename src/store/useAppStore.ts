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

  seedSampleData: () => void;
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
        settings: { cadenceMode: 'calendar', theme: 'midnight' },
        hasSeeded: false,

        getData: () => {
          const s = get();
          return {
            version: s.version,
            updatedAt: s.updatedAt,
            cards: s.cards,
            categories: s.categories,
            people: s.people,
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
            settings: data.settings,
          }),

        addCard: (input) => {
          const card: Card = {
            id: newId(),
            type: input.type,
            title: input.title.trim(),
            body: input.body?.trim() || undefined,
            verseRef: input.verseRef?.trim() || undefined,
            categoryId: input.categoryId,
            personIds: input.personIds ?? [],
            cadence: input.cadence,
            status: 'active',
            createdAt: Date.now(),
            prayCount: 0,
            prayLog: [],
            order: nextOrder(get().cards),
          };
          mutate((d) => ({ cards: [...d.cards, card] }));
          return card;
        },

        updateCard: (id, patch) =>
          mutate((d) => ({
            cards: d.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          })),

        deleteCard: (id) => mutate((d) => ({ cards: d.cards.filter((c) => c.id !== id) })),

        prayForCard: (id, now = Date.now()) =>
          mutate((d) => ({
            cards: d.cards.map((c) => (c.id === id ? markPrayed(c, now) : c)),
          })),

        archiveCard: (id) =>
          mutate((d) => ({
            cards: d.cards.map((c) => (c.id === id ? { ...c, status: 'archived' } : c)),
          })),

        unarchiveCard: (id) =>
          mutate((d) => ({
            cards: d.cards.map((c) => (c.id === id ? { ...c, status: 'active' } : c)),
          })),

        markAnswered: (id, note) =>
          mutate((d) => ({
            cards: d.cards.map((c) =>
              c.id === id
                ? { ...c, status: 'answered', answeredAt: Date.now(), answeredNote: note?.trim() || undefined }
                : c,
            ),
          })),

        reopenCard: (id) =>
          mutate((d) => ({
            cards: d.cards.map((c) =>
              c.id === id ? { ...c, status: 'active', answeredAt: undefined, answeredNote: undefined } : c,
            ),
          })),

        bulkArchive: (ids) => {
          const set = new Set(ids);
          mutate((d) => ({ cards: d.cards.map((c) => (set.has(c.id) ? { ...c, status: 'archived' } : c)) }));
        },

        bulkMarkAnswered: (ids, note) => {
          const set = new Set(ids);
          const now = Date.now();
          mutate((d) => ({
            cards: d.cards.map((c) =>
              set.has(c.id)
                ? { ...c, status: 'answered', answeredAt: now, answeredNote: note?.trim() || c.answeredNote }
                : c,
            ),
          }));
        },

        bulkSetCategory: (ids, categoryId) => {
          const set = new Set(ids);
          mutate((d) => ({ cards: d.cards.map((c) => (set.has(c.id) ? { ...c, categoryId } : c)) }));
        },

        bulkSetCadence: (ids, cadence) => {
          const set = new Set(ids);
          mutate((d) => ({ cards: d.cards.map((c) => (set.has(c.id) ? { ...c, cadence } : c)) }));
        },

        bulkDelete: (ids) => {
          const set = new Set(ids);
          mutate((d) => ({ cards: d.cards.filter((c) => !set.has(c.id)) }));
        },

        reorderCards: (orderedIds) => {
          const orderById = new Map(orderedIds.map((id, i) => [id, i]));
          mutate((d) => ({
            cards: d.cards.map((c) => (orderById.has(c.id) ? { ...c, order: orderById.get(c.id)! } : c)),
          }));
        },

        addCategory: (name, color, defaultCadence) => {
          const cat: Category = { id: newId(), name: name.trim(), color, defaultCadence };
          mutate((d) => ({ categories: [...d.categories, cat] }));
          return cat;
        },

        updateCategory: (id, patch) =>
          mutate((d) => ({
            categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          })),

        deleteCategory: (id) =>
          mutate((d) => ({
            categories: d.categories.filter((c) => c.id !== id),
            // Detach cards from the deleted category rather than deleting them.
            cards: d.cards.map((c) => (c.categoryId === id ? { ...c, categoryId: undefined } : c)),
          })),

        addPerson: (name) => {
          const person: Person = { id: newId(), name: name.trim() };
          mutate((d) => ({ people: [...d.people, person] }));
          return person;
        },

        updatePerson: (id, patch) =>
          mutate((d) => ({
            people: d.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          })),

        deletePerson: (id) =>
          mutate((d) => ({
            people: d.people.filter((p) => p.id !== id),
            cards: d.cards.map((c) =>
              c.personIds.includes(id) ? { ...c, personIds: c.personIds.filter((pid) => pid !== id) } : c,
            ),
          })),

        updateSettings: (patch) => mutate((d) => ({ settings: { ...d.settings, ...patch } })),

        seedSampleData: () => {
          if (get().hasSeeded) return;
          const family = { id: newId(), name: 'Family', color: '#f59e0b' };
          const church = { id: newId(), name: 'Church', color: '#8b5cf6' };
          const verses = { id: newId(), name: 'Verses', color: '#10b981' };
          const mom: Person = { id: newId(), name: 'Mom' };
          const friend: Person = { id: newId(), name: 'A friend' };

          const now = Date.now();
          const card = (c: Partial<Card> & Pick<Card, 'title' | 'cadence' | 'type'>): Card => ({
            id: newId(),
            body: undefined,
            personIds: [],
            status: 'active',
            createdAt: now,
            prayCount: 0,
            prayLog: [],
            order: 0,
            ...c,
          });

          set({
            categories: [family, church, verses],
            people: [mom, friend],
            cards: [
              card({
                type: 'request',
                title: "Mom's health",
                body: 'Strength and peace through her treatment.',
                categoryId: family.id,
                personIds: [mom.id],
                cadence: { kind: 'daily' },
                order: 1,
              }),
              card({
                type: 'request',
                title: 'Wisdom for a big decision',
                categoryId: family.id,
                cadence: { kind: 'daily' },
                order: 2,
              }),
              card({
                type: 'request',
                title: 'Our church leadership',
                categoryId: church.id,
                cadence: { kind: 'weekly' },
                order: 3,
              }),
              card({
                type: 'verse',
                title: 'Do not be anxious about anything…',
                body: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
                verseRef: 'Philippians 4:6',
                categoryId: verses.id,
                cadence: { kind: 'daily' },
                order: 4,
              }),
              card({
                type: 'request',
                title: 'A friend who is searching',
                personIds: [friend.id],
                cadence: { kind: 'weekly' },
                order: 5,
              }),
            ],
            hasSeeded: true,
            updatedAt: now,
          });
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
        settings: s.settings,
        hasSeeded: s.hasSeeded,
      }),
    },
  ),
);
