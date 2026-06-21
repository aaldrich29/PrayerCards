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
  body?: string; // verse text / request details (shown on front and back)
  notes?: string; // private notes — only ever shown on the back of the card
  verseRef?: string; // e.g. "Phil 4:6-7" for verse cards
  categoryId?: string;
  personIds: string[];
  cadence: Cadence;
  status: CardStatus;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms; bumped on every field change, used for sync merge
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
  updatedAt: number; // epoch ms; used for sync merge
}

export interface Person {
  id: string;
  name: string;
  updatedAt: number; // epoch ms; used for sync merge
}

export type CadenceMode = 'calendar' | 'rolling';

export type ThemeName = 'midnight' | 'light' | 'sepia' | 'paper';

export const DEFAULT_THEME: ThemeName = 'sepia';

export interface Settings {
  cadenceMode: CadenceMode;
  theme: ThemeName;
  shuffleStack: boolean;
}

/** Maps a deleted record's id to when it was deleted — lets multi-device sync tell
 * "deleted on one side" apart from "never existed on the other side" when merging. */
export type TombstoneMap = Record<string, number>;

/** The entire dataset — persisted locally and synced to Drive as one JSON blob. */
export interface AppData {
  version: number;
  updatedAt: number; // last local change, used for settings merge + "anything changed" checks
  cards: Card[];
  categories: Category[];
  people: Person[];
  deletedCardIds: TombstoneMap;
  deletedCategoryIds: TombstoneMap;
  deletedPersonIds: TombstoneMap;
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
    deletedCardIds: {},
    deletedCategoryIds: {},
    deletedPersonIds: {},
    settings: { cadenceMode: 'calendar', theme: DEFAULT_THEME, shuffleStack: true },
  };
}
