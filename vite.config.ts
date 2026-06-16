/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
  // Serve from root in dev; GitHub Pages project sites are served from /<repo>/.
  // Override the production base with VITE_BASE if the repo name differs.
  base: command === 'build' ? (process.env.VITE_BASE ?? '/PrayerCards/') : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Prayer Cards',
        short_name: 'Prayer Cards',
        description: "Carry your prayer stack. Pray over what's due today.",
        theme_color: '#1e1b4b',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Don't precache the Google Identity script; it must always be fresh & online.
        navigateFallbackDenylist: [/^\/oauth/],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
