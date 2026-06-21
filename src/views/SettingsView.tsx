import { useRef, useState } from 'react';
import type { AppData, ThemeName } from '../types';
import { SCHEMA_VERSION, DEFAULT_THEME } from '../types';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../lib/dates';
import { SyncSection } from '../components/SyncSection';
import { PRESET_STACKS, type PresetStack } from '../data/presets';
import { PresetDeployDialog } from '../components/PresetDeployDialog';

const THEMES: { name: ThemeName; label: string; bg: string; card: string; accent: string; rule?: string }[] = [
  { name: 'midnight', label: 'Midnight', bg: '#0f172a', card: '#1e293b', accent: '#6366f1' },
  { name: 'light', label: 'Light', bg: '#eef2f7', card: '#ffffff', accent: '#4f46e5' },
  { name: 'sepia', label: 'Sepia', bg: '#e8dcc5', card: '#fbf4e3', accent: '#a3672f' },
  { name: 'paper', label: 'Index Card', bg: '#c7b79b', card: '#fffdf6', accent: '#b1442f', rule: '#b9d2ec' },
];

export function SettingsView() {
  const cadenceMode = useAppStore((s) => s.settings.cadenceMode);
  const theme = useAppStore((s) => s.settings.theme ?? DEFAULT_THEME);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const cards = useAppStore((s) => s.cards);
  const unarchiveCard = useAppStore((s) => s.unarchiveCard);
  const deleteCard = useAppStore((s) => s.deleteCard);
  const people = useAppStore((s) => s.people);
  const deletePerson = useAppStore((s) => s.deletePerson);
  const getData = useAppStore((s) => s.getData);
  const replaceData = useAppStore((s) => s.replaceData);
  const fileRef = useRef<HTMLInputElement>(null);
  const [deploying, setDeploying] = useState<PresetStack | null>(null);

  const archived = cards.filter((c) => c.status === 'archived');
  const cardCountByPerson = new Map<string, number>();
  for (const c of cards) {
    if (c.status !== 'active') continue;
    for (const id of c.personIds) cardCountByPerson.set(id, (cardCountByPerson.get(id) ?? 0) + 1);
  }

  function exportJson() {
    const data = getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prayer-cards-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<AppData>;
      if (!Array.isArray(parsed.cards) || !Array.isArray(parsed.categories) || !Array.isArray(parsed.people)) {
        alert('That file does not look like a Prayer Cards backup.');
        return;
      }
      if (!confirm('Import will replace all current data on this device. Continue?')) return;
      replaceData({
        version: parsed.version ?? SCHEMA_VERSION,
        updatedAt: Date.now(),
        cards: parsed.cards,
        categories: parsed.categories,
        people: parsed.people,
        deletedCardIds: parsed.deletedCardIds ?? {},
        deletedCategoryIds: parsed.deletedCategoryIds ?? {},
        deletedPersonIds: parsed.deletedPersonIds ?? {},
        settings: parsed.settings ?? { cadenceMode: 'calendar', theme: DEFAULT_THEME, shuffleStack: true },
      });
      alert('Import complete.');
    } catch {
      alert('Could not read that file.');
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top px-4 pb-2 pt-4">
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <Section title="Appearance">
          <p className="mb-3 text-sm text-muted">Choose a look for your cards.</p>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => updateSettings({ theme: t.name })}
                className={`rounded-xl border p-2 text-left transition-colors ${
                  theme === t.name ? 'border-accent' : 'border-border'
                }`}
              >
                <div
                  className="relative mb-2 h-16 overflow-hidden rounded-lg"
                  style={{ backgroundColor: t.bg }}
                >
                  <div
                    className="absolute left-2 top-2 h-12 w-16 rounded-md shadow-sm"
                    style={{
                      backgroundColor: t.card,
                      backgroundImage: t.rule
                        ? `repeating-linear-gradient(to bottom, transparent 0 7px, ${t.rule} 7px 8px)`
                        : undefined,
                    }}
                  />
                  <div className="absolute right-2 top-2 h-4 w-4 rounded-full" style={{ backgroundColor: t.accent }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">{t.label}</span>
                  {theme === t.name && <span className="text-xs text-accent">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Prayer card sets">
          <p className="mb-3 text-sm text-muted">Add a ready-made set of cards. You choose the category and how often they come up.</p>
          <ul className="space-y-2">
            {PRESET_STACKS.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setDeploying(p)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface2 px-3 py-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted">{p.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accentink">
                    Add {p.cards.length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Section>

        <SyncSection />

        <Section title="Prayer schedule">
          <p className="mb-3 text-sm text-muted">When does a prayed card come back to the stack?</p>
          <div className="grid grid-cols-2 gap-2">
            <Option
              active={cadenceMode === 'calendar'}
              title="Calendar"
              desc="Daily resets at midnight, weekly each week, monthly each month."
              onClick={() => updateSettings({ cadenceMode: 'calendar' })}
            />
            <Option
              active={cadenceMode === 'rolling'}
              title="Rolling"
              desc="Fixed intervals (24h / 7d / 30d) from when you last prayed."
              onClick={() => updateSettings({ cadenceMode: 'rolling' })}
            />
          </div>
        </Section>

        <Section title="Backup & restore">
          <p className="mb-3 text-sm text-muted">
            Manual JSON backup, independent of Google Drive. Keep a copy anywhere you like.
          </p>
          <div className="flex gap-3">
            <button onClick={exportJson} className="flex-1 rounded-xl bg-surface2 py-3 text-sm font-medium text-ink">
              Export JSON
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 rounded-xl bg-surface2 py-3 text-sm font-medium text-ink"
            >
              Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importJson(f);
                e.target.value = '';
              }}
            />
          </div>
        </Section>

        <Section title={`People (${people.length})`}>
          {people.length === 0 ? (
            <p className="text-sm text-faint">No people yet — add one from a card's People field.</p>
          ) : (
            <ul className="space-y-2">
              {people.map((p) => {
                const count = cardCountByPerson.get(p.id) ?? 0;
                return (
                  <li key={p.id} className="flex items-center justify-between rounded-xl bg-surface2 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{p.name}</p>
                      <p className="text-xs text-faint">{count} active card{count === 1 ? '' : 's'}</p>
                    </div>
                    <button
                      onClick={() => {
                        const msg =
                          count > 0
                            ? `Delete ${p.name}? ${count} card${count === 1 ? '' : 's'} will be unassigned (not deleted).`
                            : `Delete ${p.name}?`;
                        if (confirm(msg)) deletePerson(p.id);
                      }}
                      className="shrink-0 text-xs text-red-500"
                    >
                      Delete
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title={`Archived (${archived.length})`}>
          {archived.length === 0 ? (
            <p className="text-sm text-faint">Nothing archived.</p>
          ) : (
            <ul className="space-y-2">
              {archived.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-xl bg-surface2 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{c.title}</p>
                    <p className="text-xs text-faint">added {formatDate(c.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs">
                    <button onClick={() => unarchiveCard(c.id)} className="text-accent">
                      Restore
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete permanently?')) deleteCard(c.id);
                      }}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <p className="mt-8 text-center text-xs text-faint">
          Prayer Cards · your data stays on your device unless you sync it to your own Google Drive.
        </p>
      </div>

      {deploying && <PresetDeployDialog preset={deploying} onClose={() => setDeploying(null)} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-2xl border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Option({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-3 text-left ${active ? 'border-accent bg-accentsoft' : 'border-border bg-surface2'}`}
    >
      <div className="text-sm font-medium text-ink">{title}</div>
      <div className="mt-1 text-xs text-muted">{desc}</div>
    </button>
  );
}
