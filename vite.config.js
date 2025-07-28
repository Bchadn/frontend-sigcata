import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import cesium from 'vite-plugin-cesium';
// Mengubah import untuk rollup-plugin-node-polyfills
import rollupNodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [react(), cesium()],
  base: '/',
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium')
  },
  resolve: {
    alias: {
      // Menambahkan alias untuk modul Node.js yang sering menyebabkan masalah di browser
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      // Anda mungkin perlu menambahkan lebih banyak jika muncul error lain
      // path: 'rollup-plugin-node-polyfills/polyfills/path',
      // process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        // Menggunakan default import di sini
        rollupNodePolyfills()
      ],
    },
  },
});
