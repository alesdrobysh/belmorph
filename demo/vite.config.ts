import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function copyDictPlugin() {
  return {
    name: 'copy-dict',
    buildStart() {
      const src = resolve(__dirname, '../dict');
      const dest = resolve(__dirname, 'public/dict');
      cpSync(src, dest, { recursive: true, force: true });
    },
  };
}


export default defineConfig({
  plugins: [svelte(), copyDictPlugin()],
  base: '/belmorph/',
  resolve: {
    alias: {
      'belmorph': resolve(__dirname, '../src/index.ts'),
      'belmorph/tokens': resolve(__dirname, '../src/tokens/index.ts'),
    },
  },
  server: {
    fs: { allow: ['..'] },
  },
  build: {
    assetsInlineLimit: 0,
  },
});
