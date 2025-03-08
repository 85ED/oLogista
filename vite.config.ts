import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/olojista/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});