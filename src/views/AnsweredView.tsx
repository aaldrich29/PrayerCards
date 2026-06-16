import { useMemo, useState } from 'react';
import type { Card } from '../types';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../lib/dates';
import { NoteDialog } from '../components/NoteDialog';

const DAY = 86400000;

function durationText(card: Card): string | null {
  if (!card.answeredAt) return null;
  const days = Math.max(0, Math.round((card.answeredAt - card.createdAt) / DAY));
  if (days < 1) return 'within a day';
  if (days < 7) return `over ${days} days`;
  if (days < 60) return `over ${Math.round(days / 7)} weeks`;
  return `over ${Math.round(days / 30)} months`;
}

export function AnsweredView() {
  const cards = useAppStore((s) => s.cards);
  const reopenCard = useAppStore((s) => s.reopenCard);
  const updateCard = useAppStore((s) => s.updateCard);
  const [editing, setEditing] = useState<Card | null>(null);

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
                <p className="font-medium text-ink">{c.title}</p>

                {c.answeredNote && <p className="mt-2 text-sm italic text-muted">“{c.answeredNote}”</p>}

                <dl className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted">
                  <Row label="Started praying" value={formatDate(c.createdAt)} />
                  {c.answeredAt && <Row label="Answered" value={`${formatDate(c.answeredAt)}${durationText(c) ? ` · ${durationText(c)}` : ''}`} />}
                  <Row label="Times prayed" value={`${c.prayCount}`} />
                </dl>

                <div className="mt-3 flex gap-3 text-xs">
                  <button onClick={() => setEditing(c)} className="text-accent">
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

      {editing && (
        <NoteDialog
          title="Answered note"
          label="How was this prayer answered? Leave yourself a note to look back on."
          placeholder="e.g. After months of waiting, the surgery went perfectly."
          initial={editing.answeredNote ?? ''}
          saveLabel="Save note"
          onSave={(note) => updateCard(editing.id, { answeredNote: note || undefined })}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
