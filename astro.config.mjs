// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.odurjoseph.com',
  trailingSlash: 'never',
  integrations: [sitemap()],
  build: {
    // /projects -> /projects.html so GitHub Pages serves extensionless URLs
    format: 'file',
    inlineStylesheets: 'auto',
  },
});
