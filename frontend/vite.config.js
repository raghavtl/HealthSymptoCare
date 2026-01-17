import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const disableHmr = env.VITE_DISABLE_HMR === 'true';
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    publicDir: 'public',
    server: {
      port: 3011,
      proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
            // Log request headers and body for debugging
            console.log('Request Headers:', req.headers);
            if (req.body) console.log('Request Body:', req.body);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
            // Log response headers for debugging
            console.log('Response Headers:', proxyRes.headers);
          });
        },
      },
    },
      hmr: disableHmr
        ? false
        : {
            overlay: false,
            // Disable HMR connection to 127.0.0.1:3005
            host: null,
            port: null,
            clientPort: null
          },
      watch: {
        // On Windows/OneDrive, polling is more reliable
        usePolling: true,
        interval: 1500,
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
    // Removed force: true to prevent refresh issues
    dedupe: ['react', 'react-dom', 'react-router-dom']
  }
};
});