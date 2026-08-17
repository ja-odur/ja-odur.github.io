// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.odurjoseph.com',
  trailingSlash: 'never',
  // Astro 7 defaults this to 'jsx', which strips whitespace between inline
  // elements — that ate real spaces in the nav and hero. Keep v5 behaviour.
  compressHTML: true,
  integrations: [sitemap()],
  build: {
    // /projects -> /projects.html so GitHub Pages serves extensionless URLs
    format: 'file',
    inlineStylesheets: 'auto',
  },
});
