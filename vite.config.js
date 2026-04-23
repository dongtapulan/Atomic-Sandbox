import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src', // Tells Vite the project starts in src
  publicDir: '../public', // Tells Vite the public folder is one level up
  build: {
    outDir: '../dist', // Puts the finished build in the root dist folder
    emptyOutDir: true,
  }
});