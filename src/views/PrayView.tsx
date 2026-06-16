import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Card } from '../types';
import { useAppStore } from '../store/useAppStore';
import { buildStack } from '../lib/stack';
import { SwipeDeck } from '../components/SwipeDeck';

type Scope = { kind: 'all' } | { kind: 'category'; id: string } | { kind: 'person'; id: string };

export function PrayView() {
  const cards = useAppStore((s) => s.cards);
  const categories = useAppStore((s) => s.categories);
  const people = useAppStore((s) => s.people);
  const mode = useAppStore((s) => s.settings.cadenceMode);
  const prayForCard = useAppStore((s) => s.prayForCard);

  const [scope, setScope] = useState<Scope>({ kind: 'all' });
  const [queue, setQueue] = useState<Card[]>([]);
  const [initialCount, setInitialCount] = useState(0);
  const [prayedCount, setPrayedCount] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);

  const filter = useMemo(() => {
    if (scope.kind === 'category') return { categoryId: scope.id };
    if (scope.kind === 'person') return { personId: scope.id };
    return undefined;
  }, [scope]);

  // Snapshot the stack when the scope changes, a session restarts, or the set of
  // cards changes (add/delete/first-run seed). Praying only updates a card's
  // lastPrayedAt — not the count — so the deck stays stable mid-session.
  useEffect(() => {
    const stack = buildStack({ cards, now: Date.now(), mode, filter });
    setQueue(stack);
    setInitialCount(stack.length);
    setPrayedCount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, mode, sessionKey, cards.length]);

  function handlePray(card: Card) {
    prayForCard(card.id);
    setPrayedCount((n) => n + 1);
    setQueue((q) => q.filter((c) => c.id !== card.id));
  }

  function handleSkip(card: Card) {
    setQueue((q) => q.filter((c) => c.id !== card.id));
  }

  const done = queue.length === 0;

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top px-4 pt-4">
        <h1 className="text-2xl font-bold text-slate-100">Pray</h1>
        <ScopeChips scope={scope} setScope={setScope} categories={categories} people={people} />
      </header>

      <div className="relative flex-1 px-5 pb-5 pt-2">
        {done ? (
          <DoneState initialCount={initialCount} prayedCount={prayedCount} onRestart={() => setSessionKey((k) => k + 1)} />
        ) : (
          <>
            <div className="mb-2 text-center text-sm text-slate-400">
              {initialCount - queue.length + 1} of {initialCount}
            </div>
            <div className="relative mx-auto h-[26rem] w-full max-w-sm">
              <SwipeDeck cards={queue} onPray={handlePray} onSkip={handleSkip} />
            </div>
            <div className="mt-5 flex items-center justify-center gap-10 text-xs text-slate-500">
              <span>← Later</span>
              <span>Prayed →</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ScopeChips({
  scope,
  setScope,
  categories,
  people,
}: {
  scope: Scope;
  setScope: (s: Scope) => void;
  categories: { id: string; name: string; color: string }[];
  people: { id: string; name: string }[];
}) {
  const isActive = (s: Scope) =>
    s.kind === scope.kind && (s.kind === 'all' || ('id' in s && 'id' in scope && s.id === (scope as { id: string }).id));

  const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 text-sm transition-colors ${
        active ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
      <Chip active={isActive({ kind: 'all' })} onClick={() => setScope({ kind: 'all' })}>
        Daily Stack
      </Chip>
      {categories.map((c) => (
        <Chip key={c.id} active={isActive({ kind: 'category', id: c.id })} onClick={() => setScope({ kind: 'category', id: c.id })}>
          {c.name}
        </Chip>
      ))}
      {people.map((p) => (
        <Chip key={p.id} active={isActive({ kind: 'person', id: p.id })} onClick={() => setScope({ kind: 'person', id: p.id })}>
          @{p.name}
        </Chip>
      ))}
    </div>
  );
}

function DoneState({
  initialCount,
  prayedCount,
  onRestart,
}: {
  initialCount: number;
  prayedCount: number;
  onRestart: () => void;
}) {
  const nothingDue = initialCount === 0;
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 text-6xl">{nothingDue ? '🕊️' : '🙏'}</div>
      <h2 className="text-xl font-semibold text-slate-100">
        {nothingDue ? "You're all caught up" : 'Amen.'}
      </h2>
      <p className="mt-2 max-w-xs text-sm text-slate-400">
        {nothingDue
          ? 'Nothing is due in this stack right now. Add cards or check back later.'
          : `You prayed over ${prayedCount} ${prayedCount === 1 ? 'card' : 'cards'} this session.`}
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={onRestart} className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200">
          Review again
        </button>
        <Link to="/cards" className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white">
          Manage cards
        </Link>
      </div>
    </div>
  );
}
