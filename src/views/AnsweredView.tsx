import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../lib/dates';

export function AnsweredView() {
  const cards = useAppStore((s) => s.cards);
  const reopenCard = useAppStore((s) => s.reopenCard);
  const updateCard = useAppStore((s) => s.updateCard);

  const answered = useMemo(
    () => cards.filter((c) => c.status === 'answered').sort((a, b) => (b.answeredAt ?? 0) - (a.answeredAt ?? 0)),
    [cards],
  );

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top px-4 pb-2 pt-4">
        <h1 className="text-2xl font-bold text-ink">Answered</h1>
        <p className="text-sm text-muted">Prayers God has answered — a record to look back on.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {answered.length === 0 ? (
          <div className="mt-20 text-center text-muted">
            <div className="mb-3 text-5xl">🌱</div>
            <p>No answered prayers yet.</p>
            <p className="mt-1 text-sm">Mark a card “Answered ✓” and it will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {answered.map((c) => (
              <li key={c.id} className="rounded-2xl border border-border bg-surface p-4" style={{ borderLeft: '3px solid #10b981' }}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink">{c.title}</p>
                  {c.answeredAt && <span className="shrink-0 text-xs text-emerald-500">{formatDate(c.answeredAt)}</span>}
                </div>
                {c.answeredNote && <p className="mt-2 text-sm italic text-muted">“{c.answeredNote}”</p>}
                <p className="mt-2 text-xs text-faint">Prayed {c.prayCount}× before it was answered.</p>
                <div className="mt-3 flex gap-3 text-xs">
                  <button
                    onClick={() => {
                      const note = prompt('Testimony / how it was answered', c.answeredNote ?? '');
                      if (note !== null) updateCard(c.id, { answeredNote: note.trim() || undefined });
                    }}
                    className="text-accent"
                  >
                    {c.answeredNote ? 'Edit note' : 'Add note'}
                  </button>
                  <button onClick={() => reopenCard(c.id)} className="text-muted">
                    Reopen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
