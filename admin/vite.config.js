import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const disableHmr = env.VITE_DISABLE_HMR === 'true';
  return {
    plugins: [react()],
    server: {
      port: 3006,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: disableHmr
        ? false
        : {
            host: 'localhost',
            protocol: 'ws',
            port: 3006,
            clientPort: 3006,
            overlay: false,
          },
    watch: {
      usePolling: true,
      interval: 1500,
      awaitWriteFinish: {
        stabilityThreshold: 1500,
        pollInterval: 200
      },
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/data/**',
        '**/*.sqlite',
        '**/*-journal',
        '**/*.db-journal',
        '**/legacy/**',
        '**/temp_backup/**',
        '**/~$*',
        '**/*.tmp',
        '**/*.swp',
        '**/Thumbs.db',
        '**/.DS_Store'
      ]
      }
    },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-toastify', 'react-icons'],
        },
      },
    },
    target: 'es2015',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
  }
});