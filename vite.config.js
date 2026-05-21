import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
  },

  build: {
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase':['@supabase/supabase-js'],
          'vendor-charts':  ['recharts'],
          'vendor-swiper':  ['swiper'],
          'vendor-utils':   ['date-fns', 'react-hot-toast'],
          'vendor-lucide':  ['lucide-react'],
          'vendor-icons':   ['react-icons'],
        },
      },
    },

    minify: 'esbuild',
    assetsInlineLimit: 4096,
    sourcemap: false,
    target: 'es2020',
  },

  // Let Vite pre-bundle ALL dependencies including recharts + swiper.
  // Excluding CJS packages (recharts uses lodash CJS) breaks ESM import.
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'react-hot-toast',
      'date-fns',
      'lucide-react',
      'recharts',
      'swiper',
      'sweetalert2',
      'framer-motion',
    ],
  },
})
