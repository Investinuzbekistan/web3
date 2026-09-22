import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      // The manifest is written by scripts/sync-shared.mjs from brand/, so the
      // plugin must not generate a competing one.
      manifest: false,
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            // The fact base and the region outlines: serve from cache first so a
            // returning visitor gets an instant page, then refresh in the
            // background.
            urlPattern: /\/(data\/content\.json|geo\/uz-adm1\.json)$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'iu-data', expiration: { maxEntries: 8 } },
          },
          {
            // Live FX must never be served stale without the page knowing; the
            // app already falls back to the stored rate on failure.
            urlPattern: /^https:\/\/cbu\.uz\//,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/d3-')) return 'd3';
          return undefined;
        },
      },
    },
  },
  server: { port: 5173 },
  preview: { port: 5173 },
});
