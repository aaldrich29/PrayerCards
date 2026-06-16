import { useState } from 'react';
import type { PresetStack } from '../data/presets';
import { useAppStore } from '../store/useAppStore';
import { CADENCE_PRESETS, cadenceKey, cadenceFromKey } from '../lib/cadence';

const CATEGORY_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'];

const NEW = '__new__';
const NONE = '__none__';

export function PresetDeployDialog({ preset, onClose }: { preset: PresetStack; onClose: () => void }) {
  const categories = useAppStore((s) => s.categories);
  const addCategory = useAppStore((s) => s.addCategory);
  const addCards = useAppStore((s) => s.addCards);

  // Default category: match the suggested name to an existing category, else "new".
  const existingMatch = categories.find((c) => c.name.toLowerCase() === preset.suggestedCategory?.toLowerCase());
  const [categoryChoice, setCategoryChoice] = useState<string>(existingMatch ? existingMatch.id : NEW);
  const [newName, setNewName] = useState(preset.suggestedCategory ?? preset.name);
  const [cadKey, setCadKey] = useState(cadenceKey(preset.suggestedCadence ?? { kind: 'daily' }));
  const [done, setDone] = useState<number | null>(null);

  function deploy() {
    let categoryId: string | undefined;
    if (categoryChoice === NEW) {
      const name = newName.trim();
      if (name) {
        const color = CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length];
        categoryId = addCategory(name, color).id;
      }
    } else if (categoryChoice !== NONE) {
      categoryId = categoryChoice;
    }

    const cadence = cadenceFromKey(cadKey);
    addCards(
      preset.cards.map((c) => ({
        type: c.type,
        title: c.title,
        body: c.body,
        verseRef: c.verseRef,
        categoryId,
        cadence,
      })),
    );
    setDone(preset.cards.length);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="safe-bottom max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-border bg-bg p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />

        {done != null ? (
          <div className="py-6 text-center">
            <div className="mb-3 text-5xl">✅</div>
            <h2 className="text-lg font-semibold text-ink">Added {done} cards</h2>
            <p className="mt-1 text-sm text-muted">“{preset.name}” is now in your stack.</p>
            <button onClick={onClose} className="mt-5 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accentink">
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-ink">{preset.name}</h2>
            <p className="mt-1 text-sm text-muted">{preset.description}</p>
            <p className="mt-2 text-xs text-faint">{preset.cards.length} cards</p>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Add to category</span>
              <select
                value={categoryChoice}
                onChange={(e) => setCategoryChoice(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              >
                <option value={NEW}>＋ New category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value={NONE}>No category</option>
              </select>
            </label>

            {categoryChoice === NEW && (
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New category name"
                className="mb-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm text-ink placeholder-faint focus:border-accent focus:outline-none"
              />
            )}

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Add to stack every</span>
              <select
                value={cadKey}
                onChange={(e) => setCadKey(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              >
                {CADENCE_PRESETS.map((p) => (
                  <option key={cadenceKey(p.value)} value={cadenceKey(p.value)}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-5 flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-xl bg-surface py-3 text-sm font-medium text-ink">
                Cancel
              </button>
              <button
                onClick={deploy}
                disabled={categoryChoice === NEW && !newName.trim()}
                className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-accentink disabled:opacity-40"
              >
                Add {preset.cards.length} cards
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
