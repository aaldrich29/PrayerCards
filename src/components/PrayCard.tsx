import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Card } from '../types';
import { useAppStore } from '../store/useAppStore';
import { cadenceLabel } from '../lib/cadence';
import { formatDate, formatRelative } from '../lib/dates';

/** Wrap verse text in curly quotes, unless it already carries its own quote
 * marks anywhere — some source material quotes dialogue within the verse
 * (sometimes after a leading verse number, e.g. `4 "Lift up your eyes...`),
 * and adding an outer pair on top of that looks like doubled quotes. */
function quoteVerse(text: string): string {
  const t = text.trim();
  if (/["“”]/.test(t)) return t;
  return `“${t}”`;
}

interface Props {
  card: Card;
  /** When provided, the back of the card shows Archive / Mark answered actions. */
  actions?: { onArchive: () => void; onAnswer: () => void };
}

/** A single prayer card with a tap-to-flip front (request/verse) and back (notes + stats). */
export function PrayCard({ card, actions }: Props) {
  const [flipped, setFlipped] = useState(false);
  // Select stable store arrays, then derive in render — returning a fresh array
  // from a Zustand selector would loop (new ref every render).
  const categories = useAppStore((s) => s.categories);
  const allPeople = useAppStore((s) => s.people);
  const category = categories.find((c) => c.id === card.categoryId);
  const people = allPeople.filter((p) => card.personIds.includes(p.id));

  const accent = category?.color ?? 'var(--pc-accent)';

  return (
    <div
      className="relative h-full w-full cursor-pointer select-none"
      style={{ perspective: 1200 }}
      onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Front */}
        <div
          className="pc-card absolute inset-0 flex flex-col rounded-3xl border border-border p-6 shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center justify-between">
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: accent + (category ? '22' : ''), color: accent }}
            >
              {category?.name ?? (card.type === 'verse' ? 'Verse' : 'Request')}
            </span>
            <span className="text-xs opacity-60">{cadenceLabel(card.cadence)}</span>
          </div>

          <div
            className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto py-2 text-center"
            style={{ touchAction: 'pan-y' }}
          >
            {card.type === 'verse' && card.verseRef && (
              <div className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: accent }}>
                {card.verseRef}
              </div>
            )}
            <p className="text-xl font-semibold leading-snug">{card.title}</p>
            {card.type === 'verse' && card.body && (
              <p className="mt-4 text-base italic leading-relaxed opacity-80">{quoteVerse(card.body)}</p>
            )}
            {card.type !== 'verse' && card.body && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed opacity-80">{card.body}</p>
            )}
          </div>

          {people.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {people.map((p) => (
                <span key={p.id} className="rounded-full px-2.5 py-0.5 text-xs" style={{ backgroundColor: 'var(--pc-accent-soft)' }}>
                  {p.name}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-center text-[11px] opacity-50">Tap to flip · swipe to pray</p>
        </div>

        {/* Back */}
        <div
          className="pc-card absolute inset-0 flex flex-col rounded-3xl border border-border p-6 shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">
            {card.type === 'verse' ? 'Verse' : 'Details'}
          </h3>
          <div className="mt-2 flex-1 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
            {card.body ? (
              <p className={`whitespace-pre-wrap text-base leading-relaxed ${card.type === 'verse' ? 'italic' : ''}`}>
                {card.body}
              </p>
            ) : !card.notes ? (
              <p className="text-sm opacity-50">No notes yet.</p>
            ) : null}

            {card.notes && (
              <div className={card.body ? 'mt-4 border-t border-border pt-3' : ''}>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-50">My notes</h4>
                <p className="whitespace-pre-wrap text-sm leading-relaxed opacity-90">{card.notes}</p>
              </div>
            )}
          </div>

          {card.prayLog.length > 0 && <Sparkline log={card.prayLog} />}

          <dl className="mt-4 space-y-1 border-t border-border pt-3 text-xs opacity-80">
            <div className="flex justify-between">
              <dt>Prayed</dt>
              <dd>
                {card.prayCount} {card.prayCount === 1 ? 'time' : 'times'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Last prayed</dt>
              <dd>{card.lastPrayedAt ? formatRelative(card.lastPrayedAt) : 'never'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Added</dt>
              <dd>{formatDate(card.createdAt)}</dd>
            </div>
          </dl>

          {actions && (
            <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={actions.onArchive}
                className="flex-1 rounded-lg border border-border py-2 text-xs font-medium opacity-80"
              >
                Archive
              </button>
              <button
                onClick={actions.onAnswer}
                className="flex-1 rounded-lg py-2 text-xs font-semibold text-emerald-600"
                style={{ backgroundColor: 'rgba(16,185,129,0.14)' }}
              >
                Mark answered ✓
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/** Tiny 14-day dot timeline of when this card was prayed for. */
function Sparkline({ log }: { log: number[] }) {
  const DAY = 86400000;
  const today = new Date().setHours(0, 0, 0, 0);
  const days = Array.from({ length: 14 }, (_, i) => today - (13 - i) * DAY);
  const counts = days.map((d) => log.filter((t) => t >= d && t < d + DAY).length);
  const max = Math.max(1, ...counts);
  return (
    <div className="mt-3">
      <div className="mb-1 text-[10px] uppercase tracking-wide opacity-50">Last 14 days</div>
      <div className="flex items-end gap-0.5" style={{ height: 24 }}>
        {counts.map((c, i) => (
          <div
            key={i}
            title={`${c}`}
            className="flex-1 rounded-sm"
            style={{
              height: `${Math.max(8, (c / max) * 100)}%`,
              backgroundColor: c > 0 ? 'var(--pc-accent)' : 'var(--pc-border)',
              opacity: c > 0 ? 1 : 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}
