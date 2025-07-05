import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico', 
        'logo_app.png', 
        'apple-touch-icon.png', 
        'mask-icon.svg',
        'android/*.png',
        'ios/*.png',
        'windows11/*.png'
      ],
      manifest: {
        name: 'Bulb - Social Ideas Platform',
        short_name: 'Bulb',
        description: 'A social platform for sharing and discovering innovative ideas',
        theme_color: '#E4405F',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['social', 'productivity', 'lifestyle'],
        icons: [
          // Android Icons
          {
            src: 'android/android-launchericon-48-48.png',
            sizes: '48x48',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android/android-launchericon-72-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android/android-launchericon-96-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android/android-launchericon-144-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android/android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'android/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          // Maskable icons for adaptive icons
          {
            src: 'android/android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'android/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          // iOS Icons
          {
            src: 'ios/57.png',
            sizes: '57x57',
            type: 'image/png'
          },
          {
            src: 'ios/60.png',
            sizes: '60x60',
            type: 'image/png'
          },
          {
            src: 'ios/72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'ios/76.png',
            sizes: '76x76',
            type: 'image/png'
          },
          {
            src: 'ios/114.png',
            sizes: '114x114',
            type: 'image/png'
          },
          {
            src: 'ios/120.png',
            sizes: '120x120',
            type: 'image/png'
          },
          {
            src: 'ios/144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'ios/152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'ios/167.png',
            sizes: '167x167',
            type: 'image/png'
          },
          {
            src: 'ios/180.png',
            sizes: '180x180',
            type: 'image/png'
          },
          {
            src: 'ios/1024.png',
            sizes: '1024x1024',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg}',
          'android/*.png',
          'ios/*.png', 
          'windows11/*.png'
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'documents',
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'icons',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year for icons
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Content-Security-Policy': "frame-ancestors 'self' https://auth.privy.io; frame-src 'self' https://auth.privy.io https://*.privy.io"
    }
  },
})
