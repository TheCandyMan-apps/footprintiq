import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // Defer SW registration to avoid blocking critical path
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'FootprintIQ - OSINT Intelligence Platform',
        short_name: 'FootprintIQ',
        description: 'Enterprise OSINT intelligence platform for digital footprint analysis',
        theme_color: '#7c3aed',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        categories: ['productivity', 'security', 'utilities'],
        icons: [
          {
            src: '/placeholder.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/placeholder.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/placeholder.svg',
            sizes: '1280x720',
            type: 'image/svg+xml',
            label: 'FootprintIQ Dashboard'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React - always needed
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // UI components used across app
          if (id.includes('@radix-ui/react-dialog') || 
              id.includes('@radix-ui/react-dropdown-menu') || 
              id.includes('@radix-ui/react-tabs') ||
              id.includes('@radix-ui/react-tooltip')) {
            return 'ui-vendor';
          }
          // Charts - lazy load only when needed
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'chart-vendor';
          }
          // PDF generation - lazy load only when needed
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'pdf-vendor';
          }
          // Supabase client - needed for auth check but can be deferred
          if (id.includes('@supabase/')) {
            return 'supabase-vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
