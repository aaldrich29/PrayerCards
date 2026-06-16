import { useMemo, useState } from 'react';
import { Reorder } from 'framer-motion';
import type { Card, Cadence } from '../types';
import { useAppStore } from '../store/useAppStore';
import { cadenceLabel, CADENCE_PRESETS, cadenceKey, cadenceFromKey } from '../lib/cadence';
import { CardForm } from '../components/CardForm';
import { CardDeck } from '../components/CardDeck';

type Sort = 'manual' | 'recent' | 'mostPrayed' | 'added' | 'alpha';
type CadenceFilter = 'all' | Cadence['kind'];

const SORTS: { value: Sort; label: string }[] = [
  { value: 'manual', label: 'Manual order' },
  { value: 'recent', label: 'Recently prayed' },
  { value: 'mostPrayed', label: 'Most prayed' },
  { value: 'added', label: 'Recently added' },
  { value: 'alpha', label: 'A–Z' },
];

const UNCATEGORIZED = '__none__';

export function CardsView() {
  const cards = useAppStore((s) => s.cards);
  const categories = useAppStore((s) => s.categories);
  const people = useAppStore((s) => s.people);
  const reorderCards = useAppStore((s) => s.reorderCards);

  const [creating, setCreating] = useState(false);
  const [deck, setDeck] = useState<{ title: string; ids: string[]; index: number } | null>(null);

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [fCategory, setFCategory] = useState<string>('all');
  const [fPerson, setFPerson] = useState<string>('all');
  const [fType, setFType] = useState<'all' | 'request' | 'verse'>('all');
  const [fCadence, setFCadence] = useState<CadenceFilter>('all');
  const [sort, setSort] = useState<Sort>('manual');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reorderMode, setReorderMode] = useState(false);

  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

  const hasFilters = !!search.trim() || fCategory !== 'all' || fPerson !== 'all' || fType !== 'all' || fCadence !== 'all';

  const active = useMemo(() => cards.filter((c) => c.status === 'active'), [cards]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return active.filter((c) => {
      if (fCategory !== 'all' && (c.categoryId ?? UNCATEGORIZED) !== fCategory) return false;
      if (fPerson !== 'all' && !c.personIds.includes(fPerson)) return false;
      if (fType !== 'all' && c.type !== fType) return false;
      if (fCadence !== 'all' && c.cadence.kind !== fCadence) return false;
      if (q) {
        const hay = [c.title, c.body, c.verseRef, ...c.personIds.map((id) => peopleById.get(id)?.name)]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [active, search, fCategory, fPerson, fType, fCadence, peopleById]);

  const sortCards = useMemo(() => {
    const cmp: Record<Sort, (a: Card, b: Card) => number> = {
      manual: (a, b) => a.order - b.order,
      recent: (a, b) => (b.lastPrayedAt ?? 0) - (a.lastPrayedAt ?? 0),
      mostPrayed: (a, b) => b.prayCount - a.prayCount,
      added: (a, b) => b.createdAt - a.createdAt,
      alpha: (a, b) => a.title.localeCompare(b.title),
    };
    return (list: Card[]) => [...list].sort(cmp[sort]);
  }, [sort]);

  const groups = useMemo(() => {
    const byCat = new Map<string, Card[]>();
    for (const c of filtered) {
      const key = c.categoryId ?? UNCATEGORIZED;
      (byCat.get(key) ?? byCat.set(key, []).get(key)!).push(c);
    }
    const ordered: { id: string; name: string; color: string; cards: Card[] }[] = [];
    for (const cat of categories) {
      const list = byCat.get(cat.id);
      if (list?.length) ordered.push({ id: cat.id, name: cat.name, color: cat.color, cards: sortCards(list) });
    }
    const none = byCat.get(UNCATEGORIZED);
    if (none?.length) ordered.push({ id: UNCATEGORIZED, name: 'Uncategorized', color: '#94a3b8', cards: sortCards(none) });
    return ordered;
  }, [filtered, categories, sortCards]);

  const reorderable = reorderMode; // reorder within each category by manual order

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function setGroupSelected(ids: string[], on: boolean) {
    setSelected((s) => {
      const next = new Set(s);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  }

  function exitSelect() {
    setSelectMode(false);
    setSelected(new Set());
  }

  function toggleCollapse(id: string) {
    setCollapsed((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top flex items-center justify-between px-4 pb-2 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Cards</h1>
          <span className="text-xs text-muted">{active.length} active</span>
        </div>
        <div className="flex gap-3 text-sm">
          {selectMode ? (
            <button onClick={exitSelect} className="text-muted">
              Cancel
            </button>
          ) : reorderMode ? (
            <button onClick={() => setReorderMode(false)} className="font-medium text-accent">
              Done
            </button>
          ) : (
            <>
              <button onClick={() => setReorderMode(true)} className="text-muted" disabled={active.length < 2}>
                Reorder
              </button>
              <button onClick={() => setSelectMode(true)} className="text-accent">
                Select
              </button>
            </>
          )}
        </div>
      </header>

      {/* Search + filters (hidden while reordering/selecting to reduce noise) */}
      {!reorderMode && !selectMode && (
        <div className="px-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards, notes, people…"
            className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-ink placeholder-faint focus:border-accent focus:outline-none"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`rounded-full px-3 py-1 text-xs ${hasFilters ? 'bg-accent text-accentink' : 'bg-surface2 text-muted'}`}
            >
              Filters{hasFilters ? ' •' : ''}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full bg-surface2 px-3 py-1 text-xs text-muted focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {hasFilters && (
              <button
                onClick={() => {
                  setSearch('');
                  setFCategory('all');
                  setFPerson('all');
                  setFType('all');
                  setFCadence('all');
                }}
                className="text-xs text-faint"
              >
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <FilterSelect value={fCategory} onChange={setFCategory} label="Category">
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value={UNCATEGORIZED}>Uncategorized</option>
              </FilterSelect>
              <FilterSelect value={fPerson} onChange={setFPerson} label="Person">
                <option value="all">Anyone</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </FilterSelect>
              <FilterSelect value={fType} onChange={(v) => setFType(v as 'all' | 'request' | 'verse')} label="Type">
                <option value="all">All types</option>
                <option value="request">Requests</option>
                <option value="verse">Verses</option>
              </FilterSelect>
              <FilterSelect value={fCadence} onChange={(v) => setFCadence(v as CadenceFilter)} label="Cadence">
                <option value="all">Any cadence</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="everyNDays">Custom</option>
                <option value="none">No schedule</option>
              </FilterSelect>
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex-1 overflow-y-auto px-4 pb-28">
        {groups.length === 0 ? (
          <div className="mt-20 text-center text-muted">
            <p className="text-lg">{active.length === 0 ? 'No cards yet.' : 'No cards match.'}</p>
            <p className="mt-1 text-sm">{active.length === 0 ? 'Tap + to add your first prayer card.' : 'Try clearing filters.'}</p>
          </div>
        ) : (
          groups.map((g) => {
            const isCollapsed = collapsed.has(g.id);
            return (
              <section key={g.id} className="mb-5">
                <div className="mb-2 flex items-center gap-2">
                  {selectMode &&
                    (() => {
                      const allSel = g.cards.every((c) => selected.has(c.id));
                      return (
                        <button
                          onClick={() => setGroupSelected(g.cards.map((c) => c.id), !allSel)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                            allSel ? 'border-accent bg-accent text-accentink' : 'border-border'
                          }`}
                          aria-label={allSel ? 'Deselect all in category' : 'Select all in category'}
                        >
                          {allSel ? '✓' : ''}
                        </button>
                      );
                    })()}
                  <button onClick={() => toggleCollapse(g.id)} className="flex flex-1 items-center gap-2 text-left">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{g.name}</h2>
                    <span className="text-xs text-faint">{g.cards.length}</span>
                    <span className="ml-auto text-faint">{isCollapsed ? '▸' : '▾'}</span>
                  </button>
                </div>

                {!isCollapsed &&
                  (reorderable ? (
                    <Reorder.Group
                      axis="y"
                      values={g.cards}
                      onReorder={(vals) => reorderCards(vals.map((c) => c.id))}
                      className="space-y-2"
                    >
                      {g.cards.map((c) => (
                        <Reorder.Item key={c.id} value={c} className="rounded-2xl border border-border bg-surface">
                          <div className="flex items-center gap-3 px-4 py-3">
                            <span className="text-faint">⠿</span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink">{c.title}</p>
                              <p className="text-xs text-muted">{cadenceLabel(c.cadence)}</p>
                            </div>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  ) : (
                    <ul className="space-y-2">
                      {g.cards.map((c, idx) => (
                        <CardRow
                          key={c.id}
                          card={c}
                          selectMode={selectMode}
                          selected={selected.has(c.id)}
                          onToggleSelect={() => toggleSelect(c.id)}
                          onOpen={() => setDeck({ title: g.name, ids: g.cards.map((x) => x.id), index: idx })}
                          personNames={c.personIds.map((id) => peopleById.get(id)?.name).filter(Boolean) as string[]}
                        />
                      ))}
                    </ul>
                  ))}
              </section>
            );
          })
        )}
      </div>

      {/* Bulk action bar */}
      {selectMode && <BulkBar selected={selected} onDone={exitSelect} />}

      {/* Floating add button (hidden in select/reorder modes) */}
      {!selectMode && !reorderMode && (
        <button
          onClick={() => setCreating(true)}
          className="safe-bottom fixed bottom-24 left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-3xl text-accentink shadow-lg"
          aria-label="Add card"
        >
          +
        </button>
      )}

      {creating && <CardForm onClose={() => setCreating(false)} />}
      {deck && <CardDeck title={deck.title} cardIds={deck.ids} startIndex={deck.index} onClose={() => setDeck(null)} />}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wide text-faint">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface2 px-2 py-1.5 text-xs text-ink focus:outline-none"
      >
        {children}
      </select>
    </label>
  );
}

function CardRow({
  card,
  selectMode,
  selected,
  onToggleSelect,
  onOpen,
  personNames,
}: {
  card: Card;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  personNames: string[];
}) {
  return (
    <li className="rounded-2xl border border-border bg-surface">
      <button
        onClick={selectMode ? onToggleSelect : onOpen}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        {selectMode && (
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
              selected ? 'border-accent bg-accent text-accentink' : 'border-border'
            }`}
          >
            {selected ? '✓' : ''}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-ink">{card.title}</p>
            {card.type === 'verse' && <span className="shrink-0 text-xs text-emerald-500">verse</span>}
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {cadenceLabel(card.cadence)} · prayed {card.prayCount}×{personNames.length ? ` · ${personNames.join(', ')}` : ''}
          </p>
        </div>
        {!selectMode && <span className="shrink-0 text-faint">›</span>}
      </button>
    </li>
  );
}

function BulkBar({ selected, onDone }: { selected: Set<string>; onDone: () => void }) {
  const categories = useAppStore((s) => s.categories);
  const bulkArchive = useAppStore((s) => s.bulkArchive);
  const bulkMarkAnswered = useAppStore((s) => s.bulkMarkAnswered);
  const bulkSetCategory = useAppStore((s) => s.bulkSetCategory);
  const bulkSetCadence = useAppStore((s) => s.bulkSetCadence);
  const bulkDelete = useAppStore((s) => s.bulkDelete);

  const [picker, setPicker] = useState<null | 'category' | 'cadence'>(null);
  const ids = [...selected];
  const n = ids.length;

  function run(fn: () => void) {
    fn();
    onDone();
  }

  return (
    <>
      <div className="safe-bottom fixed inset-x-0 bottom-16 z-40 mx-auto max-w-md border-t border-border bg-surface px-3 py-2">
        <div className="mb-1 text-center text-xs text-muted">{n} selected</div>
        <div className="flex justify-between gap-1 text-xs">
          <BulkBtn label="Answered" disabled={!n} onClick={() => run(() => bulkMarkAnswered(ids))} />
          <BulkBtn label="Archive" disabled={!n} onClick={() => run(() => bulkArchive(ids))} />
          <BulkBtn label="Category" disabled={!n} onClick={() => setPicker('category')} />
          <BulkBtn label="Cadence" disabled={!n} onClick={() => setPicker('cadence')} />
          <BulkBtn
            label="Delete"
            danger
            disabled={!n}
            onClick={() => {
              if (confirm(`Delete ${n} card${n === 1 ? '' : 's'} permanently?`)) run(() => bulkDelete(ids));
            }}
          />
        </div>
      </div>

      {picker === 'category' && (
        <ChoiceSheet title="Move to category" onClose={() => setPicker(null)}>
          <ChoiceItem label="None (uncategorized)" onClick={() => run(() => bulkSetCategory(ids, undefined))} />
          {categories.map((c) => (
            <ChoiceItem key={c.id} label={c.name} color={c.color} onClick={() => run(() => bulkSetCategory(ids, c.id))} />
          ))}
        </ChoiceSheet>
      )}

      {picker === 'cadence' && (
        <ChoiceSheet title="Set cadence" onClose={() => setPicker(null)}>
          {CADENCE_PRESETS.map((p) => (
            <ChoiceItem
              key={cadenceKey(p.value)}
              label={p.label}
              onClick={() => run(() => bulkSetCadence(ids, cadenceFromKey(cadenceKey(p.value))))}
            />
          ))}
        </ChoiceSheet>
      )}
    </>
  );
}

function BulkBtn({ label, onClick, disabled, danger }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 rounded-lg py-2 disabled:opacity-40 ${danger ? 'text-red-500' : 'text-ink'} active:bg-surface2`}
    >
      {label}
    </button>
  );
}

function ChoiceSheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="safe-bottom max-h-[70vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-border bg-bg p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
        <h2 className="mb-3 text-lg font-semibold text-ink">{title}</h2>
        <div className="space-y-1">{children}</div>
      </div>
    </div>
  );
}

function ChoiceItem({ label, color, onClick }: { label: string; color?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm text-ink active:bg-surface2">
      {color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />}
      {label}
    </button>
  );
}
