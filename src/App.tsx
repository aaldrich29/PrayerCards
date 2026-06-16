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
import { initSync } from './lib/sync';

export default function App() {
  const seedSampleData = useAppStore((s) => s.seedSampleData);
  const theme = useAppStore((s) => s.settings.theme ?? DEFAULT_THEME);

  // Friendly first-run sample data so the app isn't empty on first open.
  useEffect(() => {
    seedSampleData();
  }, [seedSampleData]);

  // Apply the selected theme to <html> and keep the PWA theme-color in sync.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--pc-theme-color').trim();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (themeColor && meta) meta.setAttribute('content', themeColor);
  }, [theme]);

  // If the user previously linked Google Drive, silently reconnect and sync.
  useEffect(() => {
    void initSync();
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
