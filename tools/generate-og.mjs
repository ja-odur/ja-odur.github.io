/**
 * Regenerates public/og.png — the 1200×630 social-share card.
 *
 * There is no build step for this; run it by hand when the name, title, or
 * tagline changes:
 *
 *     node tools/generate-og.mjs
 *
 * Depends on `sharp`, which is available transitively via Astro (used for its
 * image optimization). If Astro ever drops it, `npm i -D sharp` first.
 * Keep the colors in sync with src/styles/global.css design tokens.
 */
import sharp from 'sharp';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0b0d10"/>
  <defs>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="#e6edf3" fill-opacity="0.06"/>
    </pattern>
    <radialGradient id="glow" cx="0.25" cy="0.2" r="0.8">
      <stop offset="0" stop-color="#4cc9e0" stop-opacity="0.10"/>
      <stop offset="1" stop-color="#4cc9e0" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <text x="96" y="200" font-family="Menlo, monospace" font-size="30" fill="#4cc9e0">~/odur</text>
  <text x="96" y="300" font-family="Helvetica, Arial, sans-serif" font-size="76" font-weight="bold" fill="#e6edf3">Joseph Odur</text>
  <text x="96" y="368" font-family="Helvetica, Arial, sans-serif" font-size="38" fill="#a3b1bd">Senior Software Engineer</text>
  <text x="96" y="425" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#71808e">Backend · Payments · Distributed systems</text>

  <text x="96" y="540" font-family="Menlo, monospace" font-size="24" fill="#71808e">www.odurjoseph.com</text>
  <rect x="0" y="622" width="1200" height="8" fill="#4cc9e0"/>
</svg>`;

const out = new URL('../public/og.png', import.meta.url);
await sharp(Buffer.from(svg)).png().toFile(out.pathname);
console.log(`og.png written → ${out.pathname}`);
