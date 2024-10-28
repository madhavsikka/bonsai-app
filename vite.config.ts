import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const mobile = !!/android|ios/.exec(process.env.TAURI_ENV_PLATFORM);

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 5500,
    host: mobile ? '0.0.0.0' : false,
    hmr: mobile,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: {
    format: 'es' as 'es' | 'iife',
  },
}));
