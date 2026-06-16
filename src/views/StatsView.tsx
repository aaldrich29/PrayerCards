import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { totalPrayers, prayersByDay, currentStreak, activeDays, topCards } from '../lib/stats';

export function StatsView() {
  const cards = useAppStore((s) => s.cards);

  const stats = useMemo(() => {
    const now = Date.now();
    const byDay = prayersByDay(cards, 30, now);
    const last7 = byDay.slice(-7).reduce((n, d) => n + d.count, 0);
    return {
      total: totalPrayers(cards),
      streak: currentStreak(cards, now),
      activeDays: activeDays(cards),
      answered: cards.filter((c) => c.status === 'answered').length,
      byDay,
      last7,
      top: topCards(cards, 5),
    };
  }, [cards]);

  const maxDay = Math.max(1, ...stats.byDay.map((d) => d.count));
  const maxTop = Math.max(1, ...stats.top.map((c) => c.prayLog.length));

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top px-4 pb-2 pt-4">
        <h1 className="text-2xl font-bold text-ink">Stats</h1>
        <p className="text-sm text-muted">How your prayers add up over time.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {stats.total === 0 ? (
          <div className="mt-20 text-center text-muted">
            <div className="mb-3 text-5xl">📈</div>
            <p>No prayer history yet.</p>
            <p className="mt-1 text-sm">Swipe a card in Pray mode and your stats will start filling in.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Tile label="Total prayers" value={stats.total} />
              <Tile label="Current streak" value={stats.streak} suffix={stats.streak === 1 ? 'day' : 'days'} accent />
              <Tile label="This week" value={stats.last7} />
              <Tile label="Answered" value={stats.answered} />
            </div>

            <section className="mt-6 rounded-2xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Last 30 days</h2>
                <span className="text-xs text-faint">{stats.activeDays} active days</span>
              </div>
              <div className="flex items-end gap-[3px]" style={{ height: 96 }}>
                {stats.byDay.map((d) => (
                  <div
                    key={d.day}
                    title={`${new Date(d.day).toLocaleDateString()}: ${d.count}`}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${Math.max(4, (d.count / maxDay) * 100)}%`,
                      backgroundColor: d.count > 0 ? 'var(--pc-accent)' : 'var(--pc-border)',
                      opacity: d.count > 0 ? 1 : 0.5,
                    }}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-faint">
                <span>30 days ago</span>
                <span>today</span>
              </div>
            </section>

            {stats.top.length > 0 && (
              <section className="mt-6 rounded-2xl border border-border bg-surface p-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Most prayed for</h2>
                <ul className="space-y-3">
                  {stats.top.map((c) => (
                    <li key={c.id}>
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm text-ink">{c.title}</span>
                        <span className="shrink-0 text-xs text-muted">{c.prayLog.length}×</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-surface2">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(c.prayLog.length / maxTop) * 100}%`, backgroundColor: 'var(--pc-accent)' }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Tile({ label, value, suffix, accent }: { label: string; value: number; suffix?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${accent ? 'text-accent' : 'text-ink'}`}>{value}</span>
        {suffix && <span className="text-xs text-faint">{suffix}</span>}
      </div>
    </div>
  );
}
