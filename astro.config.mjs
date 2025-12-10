// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://kesavsaini.github.io',
  base: '/prompt-library', // Commenting out for local development. Uncomment for GitHub Pages deployment if using a subpath.
  integrations: [mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});