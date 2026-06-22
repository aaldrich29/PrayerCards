import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Card } from '../types';
import { useAppStore } from '../store/useAppStore';
import { buildStack, weightedShuffle } from '../lib/stack';
import { SwipeDeck } from '../components/SwipeDeck';
import { CardForm } from '../components/CardForm';
import { NoteDialog } from '../components/NoteDialog';

type Scope = { kind: 'all' } | { kind: 'category'; id: string } | { kind: 'person'; id: string };

export function PrayView() {
  const cards = useAppStore((s) => s.cards);
  const allCategories = useAppStore((s) => s.categories);
  const allPeople = useAppStore((s) => s.people);

  const activeCards = cards.filter((c) => c.status === 'active');
  const activeCategoryIds = new Set(activeCards.map((c) => c.categoryId).filter(Boolean));
  const activePersonIds = new Set(activeCards.flatMap((c) => c.personIds));
  const categories = allCategories.filter((c) => activeCategoryIds.has(c.id));
  const people = allPeople.filter((p) => activePersonIds.has(p.id));
  const mode = useAppStore((s) => s.settings.cadenceMode);
  const shuffle = useAppStore((s) => s.settings.shuffleStack ?? true);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const prayForCard = useAppStore((s) => s.prayForCard);
  const archiveCard = useAppStore((s) => s.archiveCard);
  const markAnswered = useAppStore((s) => s.markAnswered);

  const [scope, setScope] = useState<Scope>({ kind: 'all' });
  const [queue, setQueue] = useState<Card[]>([]);
  const [sessionIds, setSessionIds] = useState<string[]>([]); // cards in this session, for "Review again"
  const [initialCount, setInitialCount] = useState(0);
  const [prayedCount, setPrayedCount] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);
  const [answering, setAnswering] = useState<Card | null>(null);

  const filter = useMemo(() => {
    if (scope.kind === 'category') return { categoryId: scope.id };
    if (scope.kind === 'person') return { personId: scope.id };
    return undefined;
  }, [scope]);

  // Tracks the last "session" inputs so the effect below can tell a genuine
  // session change (rebuild + reshuffle) apart from a mere card-set change
  // (reconcile in place). Also remembers every id seen this session so we don't
  // re-add cards the user already prayed or skipped.
  const sessionDeps = useRef<{ filter: typeof filter; mode: typeof mode; shuffle: boolean; sessionKey: number } | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  // Build the stack when the scope changes, a session restarts, or shuffle is
  // toggled. When only the card set changes (e.g. you add or edit a card without
  // leaving Pray, or the first-run seed lands), reconcile in place instead:
  // append newly-due cards to the end and drop ones that are gone, so the card
  // you're looking at stays put rather than reshuffling.
  useEffect(() => {
    const prev = sessionDeps.current;
    const sessionChanged =
      !prev || prev.filter !== filter || prev.mode !== mode || prev.shuffle !== shuffle || prev.sessionKey !== sessionKey;
    sessionDeps.current = { filter, mode, shuffle, sessionKey };

    const raw = buildStack({ cards, now: Date.now(), mode, filter });

    if (sessionChanged) {
      const stack = shuffle ? weightedShuffle(raw, Date.now()) : raw;
      seenIds.current = new Set(stack.map((c) => c.id));
      setQueue(stack);
      setSessionIds(stack.map((c) => c.id));
      setInitialCount(stack.length);
      setPrayedCount(0);
      return;
    }

    const activeIds = new Set(cards.filter((c) => c.status === 'active').map((c) => c.id));
    const fresh = raw.filter((c) => !seenIds.current.has(c.id));
    fresh.forEach((c) => seenIds.current.add(c.id));

    setQueue((q) => [...q.filter((c) => activeIds.has(c.id)), ...fresh]);
    if (fresh.length) {
      setSessionIds((ids) => [...ids, ...fresh.map((c) => c.id)]);
      setInitialCount((n) => n + fresh.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, mode, shuffle, sessionKey, cards]);

  function handlePray(card: Card) {
    prayForCard(card.id);
    setPrayedCount((n) => n + 1);
    setQueue((q) => q.filter((c) => c.id !== card.id));
  }

  function handleSkip(card: Card) {
    setQueue((q) => q.filter((c) => c.id !== card.id));
  }

  // Remove a card from the deck without counting it as "prayed" (archive/answer).
  function removeFromSession(id: string) {
    setQueue((q) => q.filter((c) => c.id !== id));
    setSessionIds((ids) => ids.filter((x) => x !== id));
    setInitialCount((n) => Math.max(0, n - 1));
  }

  function handleArchive(card: Card) {
    archiveCard(card.id);
    removeFromSession(card.id);
  }

  // Mark answered from the deck: open the note dialog; on save, record + remove.
  function handleAnswerSaved(note: string) {
    if (!answering) return;
    markAnswered(answering.id, note);
    removeFromSession(answering.id);
  }

  // Replay the exact cards from this session, regardless of whether they're
  // still "due" — after praying, cards leave the stack, so rebuilding from the
  // due logic would find nothing. Pull fresh card data by id so stats are current.
  function reviewAgain() {
    const byId = new Map(cards.map((c) => [c.id, c]));
    const replay = sessionIds.map((id) => byId.get(id)).filter((c): c is Card => c != null);
    setQueue(replay);
    setInitialCount(replay.length);
    setPrayedCount(0);
  }

  const done = queue.length === 0;
  const canReview = sessionIds.length > 0;

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top px-4 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Pray</h1>
          <button
            onClick={() => updateSettings({ shuffleStack: !shuffle })}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              shuffle ? 'bg-accent text-accentink' : 'bg-surface text-muted'
            }`}
            title={shuffle ? 'Weighted shuffle on' : 'Ordered by oldest first'}
          >
            ⇄ Shuffle
          </button>
        </div>
        <ScopeChips scope={scope} setScope={setScope} categories={categories} people={people} />
      </header>

      <div className="relative flex-1 px-5 pb-5 pt-2">
        {done ? (
          <DoneState
            prayedCount={prayedCount}
            canReview={canReview}
            onReview={reviewAgain}
            onRefresh={() => setSessionKey((k) => k + 1)}
          />
        ) : (
          <>
            <div className="mb-2 text-center text-sm text-muted">
              {initialCount - queue.length + 1} of {initialCount}
            </div>
            <div className="relative mx-auto h-[30rem] w-full max-w-sm">
              <SwipeDeck
                cards={queue}
                onPray={handlePray}
                onSkip={handleSkip}
                onArchive={handleArchive}
                onAnswer={(card) => setAnswering(card)}
                onEdit={(card) => setEditing(card)}
              />
            </div>
            <div className="mt-5 flex items-center justify-center gap-10 text-xs text-faint">
              <span>← Later</span>
              <span>Prayed →</span>
            </div>
          </>
        )}
      </div>

      {/* Quick-add a card without leaving Pray */}
      <button
        onClick={() => setCreating(true)}
        className="safe-bottom fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl leading-none text-accentink shadow-lg"
        aria-label="Add card"
      >
        <span className="mt-0.5">+</span>
      </button>

      {creating && <CardForm onClose={() => setCreating(false)} />}
      {editing && <CardForm card={editing} onClose={() => setEditing(null)} />}
      {answering && (
        <NoteDialog
          title="Mark as answered"
          label="Add a note about how this prayer was answered (optional)."
          placeholder="e.g. Got the job — thank you, Lord!"
          saveLabel="Mark answered"
          onSave={handleAnswerSaved}
          onClose={() => setAnswering(null)}
        />
      )}
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
        active ? 'bg-accent text-accentink' : 'bg-surface text-muted'
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
  prayedCount,
  canReview,
  onReview,
  onRefresh,
}: {
  prayedCount: number;
  canReview: boolean;
  onReview: () => void;
  onRefresh: () => void;
}) {
  const nothingDue = !canReview;
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 text-6xl">{nothingDue ? '🕊️' : '🙏'}</div>
      <h2 className="text-xl font-semibold text-ink">{nothingDue ? "You're all caught up" : 'Amen.'}</h2>
      <p className="mt-2 max-w-xs text-sm text-muted">
        {nothingDue
          ? 'Nothing is due in this stack right now. Add cards or check back later.'
          : prayedCount > 0
            ? `You prayed over ${prayedCount} ${prayedCount === 1 ? 'card' : 'cards'} this session.`
            : 'Session complete.'}
      </p>
      <div className="mt-6 flex gap-3">
        {canReview ? (
          <button onClick={onReview} className="rounded-full bg-surface px-4 py-2 text-sm text-ink">
            Review again
          </button>
        ) : (
          <button onClick={onRefresh} className="rounded-full bg-surface px-4 py-2 text-sm text-ink">
            Refresh
          </button>
        )}
        <Link to="/cards" className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accentink">
          Manage cards
        </Link>
      </div>
    </div>
  );
}
