import { useRef } from 'react';
import type { AppData } from '../types';
import { SCHEMA_VERSION } from '../types';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../lib/dates';
import { SyncSection } from '../components/SyncSection';

export function SettingsView() {
  const cadenceMode = useAppStore((s) => s.settings.cadenceMode);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const cards = useAppStore((s) => s.cards);
  const unarchiveCard = useAppStore((s) => s.unarchiveCard);
  const deleteCard = useAppStore((s) => s.deleteCard);
  const getData = useAppStore((s) => s.getData);
  const replaceData = useAppStore((s) => s.replaceData);
  const fileRef = useRef<HTMLInputElement>(null);

  const archived = cards.filter((c) => c.status === 'archived');

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
        settings: parsed.settings ?? { cadenceMode: 'calendar' },
      });
      alert('Import complete.');
    } catch {
      alert('Could not read that file.');
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top px-4 pb-2 pt-4">
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <SyncSection />

        <Section title="Prayer schedule">
          <p className="mb-3 text-sm text-slate-400">When does a prayed card come back to the stack?</p>
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
          <p className="mb-3 text-sm text-slate-400">
            Manual JSON backup, independent of Google Drive. Keep a copy anywhere you like.
          </p>
          <div className="flex gap-3">
            <button onClick={exportJson} className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-medium text-slate-200">
              Export JSON
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-medium text-slate-200"
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

        <Section title={`Archived (${archived.length})`}>
          {archived.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing archived.</p>
          ) : (
            <ul className="space-y-2">
              {archived.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-xl bg-slate-800/50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-200">{c.title}</p>
                    <p className="text-xs text-slate-500">added {formatDate(c.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs">
                    <button onClick={() => unarchiveCard(c.id)} className="text-indigo-300">
                      Restore
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete permanently?')) deleteCard(c.id);
                      }}
                      className="text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <p className="mt-8 text-center text-xs text-slate-600">
          Prayer Cards · your data stays on your device unless you sync it to your own Google Drive.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
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
      className={`rounded-xl border p-3 text-left ${
        active ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50'
      }`}
    >
      <div className="text-sm font-medium text-slate-100">{title}</div>
      <div className="mt-1 text-xs text-slate-400">{desc}</div>
    </button>
  );
}
