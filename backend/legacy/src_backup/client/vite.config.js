const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 3005,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      port: 3005,
      clientPort: 3005,
      overlay: true
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimize chunks for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-toastify', 'react-icons'],
        },
      },
    },
    // Ensure compatibility with older browsers if needed
    target: 'es2015',
  },
  // Ensure proper handling of dynamic imports
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
});