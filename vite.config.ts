import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Uses relative base so the build works on GitHub Pages (/my-first-project/) and custom domains alike
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
