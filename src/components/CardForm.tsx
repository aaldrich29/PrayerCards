import { useState } from 'react';
import type { Card, CardType } from '../types';
import { useAppStore } from '../store/useAppStore';
import { CADENCE_PRESETS, cadenceKey, cadenceFromKey } from '../lib/cadence';

interface Props {
  card?: Card; // undefined = create
  onClose: () => void;
}

const CATEGORY_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'];

export function CardForm({ card, onClose }: Props) {
  const categories = useAppStore((s) => s.categories);
  const people = useAppStore((s) => s.people);
  const addCard = useAppStore((s) => s.addCard);
  const updateCard = useAppStore((s) => s.updateCard);
  const deleteCard = useAppStore((s) => s.deleteCard);
  const addCategory = useAppStore((s) => s.addCategory);
  const addPerson = useAppStore((s) => s.addPerson);

  const [type, setType] = useState<CardType>(card?.type ?? 'request');
  const [title, setTitle] = useState(card?.title ?? '');
  const [verseRef, setVerseRef] = useState(card?.verseRef ?? '');
  const [body, setBody] = useState(card?.body ?? '');
  const [categoryId, setCategoryId] = useState<string | undefined>(card?.categoryId);
  const [personIds, setPersonIds] = useState<string[]>(card?.personIds ?? []);
  const [cadKey, setCadKey] = useState(cadenceKey(card?.cadence ?? { kind: 'daily' }));

  const canSave = title.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    const cadence = cadenceFromKey(cadKey);
    if (card) {
      updateCard(card.id, {
        type,
        title: title.trim(),
        verseRef: verseRef.trim() || undefined,
        body: body.trim() || undefined,
        categoryId,
        personIds,
        cadence,
      });
    } else {
      addCard({ type, title, verseRef, body, categoryId, personIds, cadence });
    }
    onClose();
  }

  function togglePerson(id: string) {
    setPersonIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function quickAddCategory() {
    const name = prompt('New category name')?.trim();
    if (!name) return;
    const color = CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length];
    const cat = addCategory(name, color);
    setCategoryId(cat.id);
  }

  function quickAddPerson() {
    const name = prompt('Person name')?.trim();
    if (!name) return;
    const p = addPerson(name);
    setPersonIds((ids) => [...ids, p.id]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="safe-bottom max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-slate-700 bg-slate-900 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-700" />
        <h2 className="mb-4 text-lg font-semibold text-slate-100">{card ? 'Edit card' : 'New card'}</h2>

        {/* Type */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(['request', 'verse'] as CardType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-xl py-2 text-sm font-medium capitalize ${
                type === t ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {type === 'verse' && (
          <Field label="Reference">
            <input
              value={verseRef}
              onChange={(e) => setVerseRef(e.target.value)}
              placeholder="e.g. Philippians 4:6"
              className={inputClass}
            />
          </Field>
        )}

        <Field label={type === 'verse' ? 'Verse title / theme' : 'Request'}>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'verse' ? 'Short title for the verse' : 'What are you praying for?'}
            rows={2}
            className={inputClass}
          />
        </Field>

        <Field label={type === 'verse' ? 'Verse text' : 'Notes (optional)'}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={type === 'verse' ? 'Paste the verse text' : 'Any details or context'}
            rows={3}
            className={inputClass}
          />
        </Field>

        {/* Category */}
        <Field label="Category">
          <div className="flex gap-2">
            <select
              value={categoryId ?? ''}
              onChange={(e) => setCategoryId(e.target.value || undefined)}
              className={inputClass}
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button onClick={quickAddCategory} className="shrink-0 rounded-xl bg-slate-800 px-3 text-sm text-indigo-300">
              + New
            </button>
          </div>
        </Field>

        {/* People */}
        <Field label="People">
          <div className="flex flex-wrap gap-2">
            {people.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePerson(p.id)}
                className={`rounded-full px-3 py-1 text-sm ${
                  personIds.includes(p.id) ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {p.name}
              </button>
            ))}
            <button onClick={quickAddPerson} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-indigo-300">
              + New
            </button>
          </div>
        </Field>

        {/* Cadence */}
        <Field label="Add to stack">
          <select value={cadKey} onChange={(e) => setCadKey(e.target.value)} className={inputClass}>
            {CADENCE_PRESETS.map((p) => (
              <option key={cadenceKey(p.value)} value={cadenceKey(p.value)}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="mt-5 flex gap-3">
          {card && (
            <button
              onClick={() => {
                if (confirm('Delete this card permanently?')) {
                  deleteCard(card.id);
                  onClose();
                }
              }}
              className="rounded-xl bg-red-500/15 px-4 py-3 text-sm font-medium text-red-300"
            >
              Delete
            </button>
          )}
          <button onClick={onClose} className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-medium text-slate-200">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  );
}
