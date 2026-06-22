import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BottomTabs } from './components/BottomTabs';
import { PrayView } from './views/PrayView';
import { CardsView } from './views/CardsView';
import { AnsweredView } from './views/AnsweredView';
import { StatsView } from './views/StatsView';
import { SettingsView } from './views/SettingsView';
import { useAppStore } from './store/useAppStore';
import { DEFAULT_THEME } from './types';
import { initSync, completeRedirectSignIn } from './lib/sync';
import { preloadGis } from './lib/auth';

export default function App() {
  const seedWelcomeCard = useAppStore((s) => s.seedWelcomeCard);
  const theme = useAppStore((s) => s.settings.theme ?? DEFAULT_THEME);

  // First-run: a single instructional card instead of fake sample data.
  useEffect(() => {
    seedWelcomeCard();
  }, [seedWelcomeCard]);

  // Load the Google sign-in script ahead of time so a later tap on "Sign in"
  // fires requestAccessToken() with minimal delay (mobile popup blockers are
  // strict about how soon after a click a popup opens).
  useEffect(() => {
    preloadGis();
  }, []);

  // Apply the selected theme to <html> and keep the PWA theme-color in sync.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--pc-theme-color').trim();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (themeColor && meta) meta.setAttribute('content', themeColor);
  }, [theme]);

  // On start: if we're returning from the redirect sign-in flow, finish linking;
  // otherwise, if previously linked, silently reconnect and sync.
  useEffect(() => {
    void (async () => {
      const handledRedirect = await completeRedirectSignIn();
      if (!handledRedirect) void initSync();
    })();
  }, []);

  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<PrayView />} />
          <Route path="/cards" element={<CardsView />} />
          <Route path="/answered" element={<AnsweredView />} />
          <Route path="/stats" element={<StatsView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </main>
      <BottomTabs />
    </div>
  );
}
