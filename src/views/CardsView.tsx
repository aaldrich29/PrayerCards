import { useMemo, useState } from 'react';
import type { Card } from '../types';
import { useAppStore } from '../store/useAppStore';
import { cadenceLabel } from '../lib/cadence';
import { CardForm } from '../components/CardForm';

export function CardsView() {
  const cards = useAppStore((s) => s.cards);
  const categories = useAppStore((s) => s.categories);
  const archiveCard = useAppStore((s) => s.archiveCard);
  const markAnswered = useAppStore((s) => s.markAnswered);

  const [editing, setEditing] = useState<Card | null>(null);
  const [creating, setCreating] = useState(false);

  const active = useMemo(() => cards.filter((c) => c.status === 'active'), [cards]);

  const groups = useMemo(() => {
    const byCat = new Map<string, Card[]>();
    for (const c of active) {
      const key = c.categoryId ?? '__none__';
      const arr = byCat.get(key) ?? [];
      arr.push(c);
      byCat.set(key, arr);
    }
    const ordered: { id: string; name: string; color: string; cards: Card[] }[] = [];
    for (const cat of categories) {
      const list = byCat.get(cat.id);
      if (list?.length) ordered.push({ id: cat.id, name: cat.name, color: cat.color, cards: sortCards(list) });
    }
    const none = byCat.get('__none__');
    if (none?.length) ordered.push({ id: '__none__', name: 'Uncategorized', color: '#64748b', cards: sortCards(none) });
    return ordered;
  }, [active, categories]);

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top flex items-center justify-between px-4 pb-2 pt-4">
        <h1 className="text-2xl font-bold text-slate-100">Cards</h1>
        <span className="text-sm text-slate-400">{active.length} active</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {groups.length === 0 ? (
          <div className="mt-20 text-center text-slate-400">
            <p className="text-lg">No cards yet.</p>
            <p className="mt-1 text-sm">Tap + to add your first prayer card.</p>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.id} className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{g.name}</h2>
                <span className="text-xs text-slate-500">{g.cards.length}</span>
              </div>
              <ul className="space-y-2">
                {g.cards.map((c) => (
                  <li key={c.id} className="rounded-2xl border border-slate-800 bg-slate-800/50">
                    <button onClick={() => setEditing(c)} className="block w-full px-4 py-3 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-slate-100">{c.title}</p>
                        {c.type === 'verse' && <span className="shrink-0 text-xs text-emerald-400">verse</span>}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {cadenceLabel(c.cadence)} · prayed {c.prayCount}×
                      </p>
                    </button>
                    <div className="flex border-t border-slate-800 text-xs">
                      <button
                        onClick={() => markAnswered(c.id)}
                        className="flex-1 py-2 text-emerald-300 active:bg-slate-800"
                      >
                        Answered ✓
                      </button>
                      <span className="w-px bg-slate-800" />
                      <button onClick={() => archiveCard(c.id)} className="flex-1 py-2 text-slate-400 active:bg-slate-800">
                        Archive
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setCreating(true)}
        className="safe-bottom fixed bottom-20 left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-indigo-500 text-3xl text-white shadow-lg shadow-indigo-900/50"
        aria-label="Add card"
      >
        +
      </button>

      {creating && <CardForm onClose={() => setCreating(false)} />}
      {editing && <CardForm card={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function sortCards(list: Card[]): Card[] {
  return [...list].sort((a, b) => a.order - b.order);
}
