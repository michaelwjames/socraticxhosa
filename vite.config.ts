import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['marx-logo.png'],
      manifest: {
        name: 'Xhosa Kapital',
        short_name: 'Xhosa\u00ADKapital',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#111827',
        theme_color: '#111827',
        description: 'Learn isiXhosa: course, dictionary, vocab practice, and texts.',
        icons: [
          { src: '/marx-logo.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/marx-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ],
      },
    }),
  ],
})
