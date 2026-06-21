import { useMemo, useState } from 'react';
import type { Card } from '../types';
import { useAppStore } from '../store/useAppStore';
import { SwipeDeck } from './SwipeDeck';
import { CardForm } from './CardForm';
import { NoteDialog } from './NoteDialog';

interface Props {
  title: string;
  cardIds: string[]; // the group, in display order
  startIndex: number; // tapped card's index within the group
  onClose: () => void;
}

/**
 * Full-screen deck for praying through a group of cards on demand (e.g. tapping a
 * card in Manage Cards). Unlike the Pray tab, it includes every card in the group
 * regardless of whether it's "due", starting at the tapped card.
 */
export function CardDeck({ title, cardIds, startIndex, onClose }: Props) {
  const cards = useAppStore((s) => s.cards);
  const prayForCard = useAppStore((s) => s.prayForCard);
  const archiveCard = useAppStore((s) => s.archiveCard);
  const markAnswered = useAppStore((s) => s.markAnswered);

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  // Start at the tapped card and rotate through the whole group once.
  const [remaining, setRemaining] = useState<string[]>(() => [
    ...cardIds.slice(startIndex),
    ...cardIds.slice(0, startIndex),
  ]);
  const total = remaining.length;

  const [editing, setEditing] = useState<Card | null>(null);
  const [answering, setAnswering] = useState<Card | null>(null);

  // Map remaining ids to current card objects (kept fresh so edits show immediately).
  const queue = remaining.map((id) => byId.get(id)).filter((c): c is Card => c != null);
  const front = queue[0];

  function drop(id: string) {
    setRemaining((r) => r.filter((x) => x !== id));
  }

  const done = queue.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <header className="safe-top flex items-center justify-between gap-3 px-4 pb-2 pt-4">
        <button onClick={onClose} className="text-sm text-muted" aria-label="Close">
          ✕
        </button>
        <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>
        <button
          onClick={() => front && setEditing(front)}
          disabled={!front}
          className="text-sm text-accent disabled:opacity-40"
        >
          Edit
        </button>
      </header>

      <div className="relative flex-1 px-5 pb-6 pt-2">
        {done ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 text-6xl">🙏</div>
            <h3 className="text-xl font-semibold text-ink">Amen.</h3>
            <p className="mt-2 text-sm text-muted">You've prayed through {title}.</p>
            <button onClick={onClose} className="mt-6 rounded-full bg-accent px-5 py-2 text-sm font-medium text-accentink">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-2 text-center text-sm text-muted">
              {total - queue.length + 1} of {total}
            </div>
            <div className="relative mx-auto h-[30rem] w-full max-w-sm">
              <SwipeDeck
                cards={queue}
                onPray={(c) => {
                  prayForCard(c.id);
                  drop(c.id);
                }}
                onSkip={(c) => drop(c.id)}
                onArchive={(c) => {
                  archiveCard(c.id);
                  drop(c.id);
                }}
                onAnswer={(c) => setAnswering(c)}
              />
            </div>
            <div className="mt-5 flex items-center justify-center gap-10 text-xs text-faint">
              <span>← Later</span>
              <span>Prayed →</span>
            </div>
          </>
        )}
      </div>

      {editing && <CardForm card={editing} onClose={() => setEditing(null)} />}
      {answering && (
        <NoteDialog
          title="Mark as answered"
          label="Add a note about how this prayer was answered (optional)."
          placeholder="e.g. Got the job — thank you, Lord!"
          saveLabel="Mark answered"
          onSave={(note) => {
            markAnswered(answering.id, note);
            drop(answering.id);
          }}
          onClose={() => setAnswering(null)}
        />
      )}
    </div>
  );
}
