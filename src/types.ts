export type CardType = 'request' | 'verse';

export type CardStatus = 'active' | 'archived' | 'answered';

/** How often a card should re-enter the prayer stack. */
export type Cadence =
  | { kind: 'none' } // no auto-scheduling; only appears in manually chosen stacks
  | { kind: 'daily' | 'weekly' | 'monthly' } // calendar-period based
  | { kind: 'everyNDays'; n: number }; // rolling custom interval

export interface Card {
  id: string;
  type: CardType;
  title: string; // front of the card
  body?: string; // details / notes (back of the card)
  verseRef?: string; // e.g. "Phil 4:6-7" for verse cards
  categoryId?: string;
  personIds: string[];
  cadence: Cadence;
  status: CardStatus;
  createdAt: number; // epoch ms
  lastPrayedAt?: number;
  prayCount: number;
  prayLog: number[]; // timestamps; kept lean, may be trimmed/aggregated later
  answeredAt?: number;
  answeredNote?: string;
  order: number; // manual ordering within a category
}

export interface Category {
  id: string;
  name: string;
  color: string;
  defaultCadence?: Cadence;
}

export interface Person {
  id: string;
  name: string;
}

export type CadenceMode = 'calendar' | 'rolling';

export type ThemeName = 'midnight' | 'light' | 'sepia' | 'paper';

export const DEFAULT_THEME: ThemeName = 'midnight';

export interface Settings {
  cadenceMode: CadenceMode;
  theme: ThemeName;
}

/** The entire dataset — persisted locally and synced to Drive as one JSON blob. */
export interface AppData {
  version: number;
  updatedAt: number; // for sync conflict resolution (last-write-wins)
  cards: Card[];
  categories: Category[];
  people: Person[];
  settings: Settings;
}

export const SCHEMA_VERSION = 1;

export function emptyAppData(now: number = Date.now()): AppData {
  return {
    version: SCHEMA_VERSION,
    updatedAt: now,
    cards: [],
    categories: [],
    people: [],
    settings: { cadenceMode: 'calendar', theme: DEFAULT_THEME },
  };
}
