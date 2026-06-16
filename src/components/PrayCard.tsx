import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Card } from '../types';
import { useAppStore } from '../store/useAppStore';
import { cadenceLabel } from '../lib/cadence';
import { formatDate, formatRelative } from '../lib/dates';

interface Props {
  card: Card;
}

/** A single prayer card with a tap-to-flip front (request/verse) and back (notes + stats). */
export function PrayCard({ card }: Props) {
  const [flipped, setFlipped] = useState(false);
  // Select stable store arrays, then derive in render — returning a fresh array
  // from a Zustand selector would loop (new ref every render).
  const categories = useAppStore((s) => s.categories);
  const allPeople = useAppStore((s) => s.people);
  const category = categories.find((c) => c.id === card.categoryId);
  const people = allPeople.filter((p) => card.personIds.includes(p.id));

  const accent = category?.color ?? '#6366f1';

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
          className="absolute inset-0 flex flex-col rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center justify-between">
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: accent + '22', color: accent }}
            >
              {category?.name ?? (card.type === 'verse' ? 'Verse' : 'Request')}
            </span>
            <span className="text-xs text-slate-400">{cadenceLabel(card.cadence)}</span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            {card.type === 'verse' && card.verseRef && (
              <div className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: accent }}>
                {card.verseRef}
              </div>
            )}
            <p className="text-xl font-semibold leading-snug text-slate-100">{card.title}</p>
            {card.type === 'verse' && card.body && (
              <p className="mt-4 text-base italic leading-relaxed text-slate-300">“{card.body}”</p>
            )}
          </div>

          {people.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {people.map((p) => (
                <span key={p.id} className="rounded-full bg-slate-700/60 px-2.5 py-0.5 text-xs text-slate-200">
                  {p.name}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-center text-[11px] text-slate-500">Tap to flip · swipe to pray</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Notes</h3>
          <div className="mt-2 flex-1 overflow-y-auto">
            {card.type !== 'verse' && card.body ? (
              <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-200">{card.body}</p>
            ) : card.type === 'verse' && card.body ? (
              <p className="whitespace-pre-wrap text-base italic leading-relaxed text-slate-200">{card.body}</p>
            ) : (
              <p className="text-sm text-slate-500">No notes yet.</p>
            )}
          </div>
          <dl className="mt-4 space-y-1 border-t border-slate-700 pt-3 text-xs text-slate-400">
            <div className="flex justify-between">
              <dt>Prayed</dt>
              <dd className="text-slate-200">
                {card.prayCount} {card.prayCount === 1 ? 'time' : 'times'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Last prayed</dt>
              <dd className="text-slate-200">{card.lastPrayedAt ? formatRelative(card.lastPrayedAt) : 'never'}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Added</dt>
              <dd className="text-slate-200">{formatDate(card.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </motion.div>
    </div>
  );
}
