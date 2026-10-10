# CLAUDE.md

Guidance for working in this repo. Read this before making changes.

## What this is

Personal website for **Joseph Odur** (senior software engineer, backend/payments)
— live at **https://www.odurjoseph.com**, deployed on GitHub Pages. Goal: a
premium, fast, minimal engineering portfolio that reads as intentional and
handcrafted (reference points: Stripe, Vercel, Linear). Dark-mode first.

It was **migrated from Create React App (SPA) to Astro** in 2026. The old CRA
app is gone; `old_profile/` holds the pre-React static site and is ignored by
the build.

## Stack & why

- **Astro 5, static output** — everything renders to HTML at build time. The
  SPA it replaced was invisible to crawlers (HashRouter → one URL, no content).
  Astro fixed SEO and ships **zero framework runtime**.
- **TypeScript** — all content lives in typed modules under `src/data/`.
- **Plain CSS** — design tokens in `src/styles/global.css`, component styles
  scoped inside `.astro` files. No CSS framework, no CSS-in-JS.
- **One hand-written script**, `src/scripts/enhance.ts` — the ONLY meaningful
  JS shipped (~7 kB gzipped, one bundle; it imports `machine-mode.ts`). Powers
  machine mode + easter eggs. Everything it does is progressive enhancement;
  the site is fully usable with JS off.

Do not add React/Vue/heavy deps or a UI framework. Do not add a client-side
router. If a feature can be static HTML + a little vanilla TS, keep it that way.

## Commands

```sh
npm run dev       # dev server, http://localhost:4321
npm run build     # static output to dist/
npm run preview   # serve the production build
npm run check     # astro check (type-check) — run before considering work done
npm run deploy    # build + push dist/ to the gh-pages branch
```

Node 22. After any change, run `npm run check` (must be 0/0/0) and, for
anything visible, verify in the browser preview.

## Architecture / where things live

```
src/
  data/          SINGLE SOURCE OF TRUTH for content
    profile.ts     identity, links, summary, yearsOfExperience()
    experience.ts  work history (typed Experience[])
    projects.ts    project write-ups (problem → build → stack)
    skills.ts      skills, education, interests
    machine.ts     builds the machine-readable context doc (see below)
  components/     Nav, Footer, Hero, ProjectCard, MachineMode, Terminal
  layouts/
    BaseLayout.astro   <head> SEO, JSON-LD, page chrome, mounts enhance.ts
  pages/          index, projects, resume, 404, llms.txt.ts (endpoint)
  scripts/
    enhance.ts     entry point: easter eggs, boots machine mode (vanilla TS, PE only)
    machine-mode.ts  the divider: tokenizer, back faces, live mirror
  styles/global.css  tokens, reset, print styles, easter-egg layers
public/           CNAME, robots.txt, favicon.svg, og.png, jokes.json, icons
tools/            one-off maintenance scripts (generate-og.mjs) — not built
```

**Content edits go in `src/data/*` — not in markup.** Pages, the resume,
`/llms.txt`, and machine mode all render from those modules.

Path alias: **`~/*` → `src/*`** (tsconfig). Use it in imports.

## Non-obvious decisions & gotchas

Read these before touching the relevant area — each one cost real debugging.

- **`format: 'file'` + `trailingSlash: 'never'`** (astro.config.mjs). Builds
  `/projects` → `dist/projects.html` so GitHub Pages serves extensionless URLs.
  Canonicals and the sitemap strip `.html`; keep that invariant if you add pages.
- **The homepage pathname is `/index`, not `/`.** With `format: 'file'`, Astro 7
  reports `Astro.url.pathname` as `/index` for the index route (Astro 5 gave
  `/`). BaseLayout's canonical (and `og:url`) and Nav's active-link check both
  strip a trailing `index` — without that the homepage canonicalises to
  `/index`. Normalise pathnames in any new consumer.
- **`compressHTML: true` is pinned deliberately.** Astro 7 defaults it to
  `'jsx'`, which strips whitespace between inline elements — that ate real
  spaces in the nav and hero. Don't drop it to take the new default.
- **JSON-LD needs `is:inline`** on its `<script type="application/ld+json">` in
  BaseLayout, or Astro tries to process it as a module. Same for the theme
  bootstrap script in `<head>`.
- **Theme persistence is sessionStorage, not localStorage, by design.** Themes
  (`dark` default, `light`, `blueprint`) stick across page navigations but
  **reset on a full reload**. The `<head>` inline script reads
  `performance.getEntriesByType('navigation')[0].type === 'reload'` and clears
  the key before first paint (no flash). `setTheme()` in enhance.ts is the only
  writer. `dark` deletes the key / `data-theme` attr rather than storing "dark".
- **`<dialog>` implicit form submit is unreliable** — the terminal handles
  `Enter` (and Tab/↑/↓) via a direct `keydown` listener on the input, not form
  `submit`. Don't "simplify" back to a submit handler.
- **Machine mode + `/llms.txt` share one source**: `machineContext()` in
  `src/data/machine.ts`. The human pages and the machine doc are built from the
  same data, so they can't drift. Edit data, not the doc string.
- **Scroll-reveal is gated behind `html.js`.** The `<head>` script adds `.js`
  to `<html>`; `.scroll-reveal` is only hidden-then-revealed when `.js` is
  present. Without JS, content is always visible. Never hide content in a way
  that a no-JS visitor can't recover.
- **Heading order matters for a11y/SEO.** `ProjectCard` takes a `headingLevel`
  prop (`h2` under a page `h1`, `h3` under a section `h2`). Keep one `h1` per
  page and no skipped levels.
- **`public/` assets are NOT content-hashed** → GitHub Pages caches them ~10
  min (vs. forever for hashed `_astro/` bundles). This is the right tradeoff for
  editable content (`jokes.json`, future blog/game JSON): edits go live without
  touching the JS bundle, but repeat visitors may lag a few minutes.
- **`public/CNAME`** preserves the custom domain on deploy — do not delete.
- **Fonts are self-hosted** via `@fontsource-variable/inter` (imported in
  BaseLayout). No Google Fonts network calls. Mono is the system stack.
- **Every animation has a `prefers-reduced-motion` fallback** (hero typing,
  machine-mode divider slide, DLX solve, blink). Match this for any new motion.
- **og.png is a generated static asset** (1200×630). Regenerate with
  `node tools/generate-og.mjs` when the name/title/tagline changes — there is no
  build step that does so automatically. The generator uses `sharp` (transitive
  via Astro) and mirrors the design tokens.

## "For Machines" mode

A vertical divider is the only control (there is no nav toggle). At rest it
sits centered in the empty right margin with "humans | machines" labels
showing; where the margin can't hold the labels at least 20px clear of the
content column (phones, windows under ~1100px), it rests at the far edge as a
compact grip inside the page gutter. Either way nothing touches content and
the page is plain human. Drag it into the content, or click its grip, and
everything right of the line is the page as a language model receives it: same
layout, every word replaced in place by its token IDs — each ID in the word's
own font, size and weight, on its baseline, condensed horizontally to the
word's width so text and tokens meet at the divider at the same scale (hover
shows the word). A click opens it a quarter
of the way across the content column; a click, Esc, the bar's exit, or End
returns it to rest. A fixed bar gives the page's token count, `/llms.txt`, and "copy
context" (the `machineContext()` doc). The position persists like the theme —
`sessionStorage['mk-split']` (a fraction, or `default`), kept across
navigations, cleared on a full reload by the `<head>` script. This is the
feature the owner cares most about — treat it as first-class, keep it tasteful
(no gimmicks). Mechanics are documented at the top of
`src/scripts/machine-mode.ts`; the gotchas that cost debugging time:

- **The seam must be pixel-exact.** Both layers are clipped at `--mk-split` (a
  viewport x) minus each block's own `--mk-left`, so every block cuts at the
  same line; hit-testing follows clip-path, so links work on either side.
  Anything that differs between the layers shows at the line, hence the next
  three points.
- **Backs are clones, not wrappers.** Each block in `#main` (+ the footer) gets
  an absolutely positioned clone in `.mk-backs`. Never wrap or move the real
  blocks — re-inserting a node restarts its CSS animations (the hero's reveal).
- **Place backs from layout, never a transformed rect.** `layoutBox()` removes
  the scroll-reveal slide (a pure translation) from the exact rect; an
  untransformed measurement put tokens 20px off, and whole-pixel offset* left a
  half-pixel seam on centered columns. Backs keep the same scroll-reveal class
  as their fronts, so both slide in together. They also re-place on font load
  and on every activation — a late web font re-wraps a line and shifts every
  block below, and ResizeObserver only reports while the page is rendering.
- **The back mirrors the live front synchronously** (MutationObserver, flushed
  in the same task — a frame's lag showed old text on one side of the seam):
  text is re-tokenized (the hero typing riff types in tokens), classes and the
  root's inline style copied (scroll-reveal, caret, hero glow), and cloned CSS
  animations are set to their originals' clocks (`syncAnimations()`). Pointer
  moves and button clicks on the back are forwarded to the front, so the glow
  and the easter eggs keep working.
- **Known sub-pixel residue: kerning.** Splitting a word into token spans drops
  the kerning pair at the split, so glyph positions inside a line can drift up
  to ~0.4px from the front's. Block boxes and line breaks match exactly. Only
  `font-kerning: none` on the human page would remove it — not worth the type.
- **One `.mk-run` span per text node.** Loose token spans inside a flex/grid
  parent (the hero kicker) each become an item and stop wrapping, which
  overflowed the page on phones.
- **The token side switches on only when the line crosses into the content**
  (`rest.contentRight`), not when it leaves its resting spot — in the margin
  there's nothing to tokenize, so a normal visit builds nothing and shows no
  bar. At a compact rest only the grip takes the pointer, so the hit strip
  never blocks content near the edge. Backs are built when the grip is first
  hovered or focused, so the first drag never hitches.
- **`mk-pending` stops the plain-text flash on navigation.** enhance.ts runs
  after first paint, so the `<head>` script adds `html.mk-pending` when
  `sessionStorage['mk-split']` is set; CSS hides `#main` + footer until the
  token side is up. A 2.5s CSS unhide is the safety net if the script never
  runs — keep it.
- **Terminal output and toasts (jokes) are tokenized in place,** whenever the
  divider is open — the terminal is a modal dialog, toasts are transient, so
  neither has a back. Their token styling is scoped to
  `body.machine-active .mk-live`, so the same spans read as plain text once
  docked. The terminal input stays plain on purpose (the human side).
- **Back-face words hide with `visibility`, live ones with `opacity`.** Under
  the terminal's `backdrop-filter`, Chrome painted `opacity: 0` back-face
  words anyway; `opacity` stays on live surfaces so screen readers keep the
  terminal text.
- **Every token shows an ID; that's what the ID bands are for.** At the
  word's own size a five-digit ID can't fit "a" or a comma, so IDs are banded
  the way a real vocabulary is (frequent pieces merged first, small IDs):
  ASCII punctuation uses the real byte-token IDs ("," 11, "." 13), other
  symbols and single characters two digits, common words three to four,
  rare fragments five. Pieces are at least three letters (a one-letter tail
  read as a missing token). In `fit()`, a token borrows half of each
  adjacent space, never more, so neighbours can't collide; one still too
  narrow (a paragraph-ending period) is laid out with its whole word, the
  word's IDs sharing its width in proportion. `MIN_CONDENSE` (30%) is now a
  floor no current page reaches.
- **The tokenizer is illustrative** (hash IDs into a cl100k-sized vocabulary),
  deterministic per string. Backs are client-side only — crawlers never see
  them; `/llms.txt` stays the real machine document.

## Easter eggs (maintainer reference — keep OUT of the README)

All are opt-in, keyboard/pointer-triggered, zero cost until used, and defined in
`enhance.ts` (+ styles in global.css):

- **Footer terminal** (backtick `` ` `` or the footer button). Commands:
  `help, whoami, stats, sudo hire odur, theme dark|light|blueprint, fullscreen,
  joke, ls, blog, games, clear, exit`. Has command history (↑/↓), Tab
  completion, and a fullscreen mode (Esc steps down: fullscreen → window → close).
- **Konami code** → developer mode: reveals `data-devnote` annotations on
  elements (implementation notes).
- **Shift+D** design grid overlay · **Shift+P** live performance panel
  (real Navigation/Resource Timing + LCP).
- **DLX / Sudoku**: clicking the mini-grid on the *Puzzled* project card runs a
  Dancing-Links "solve" animation (nod to Algorithm X; owner likes Sudoku).
- **Footer `{;}` glyph** and terminal `joke` → the "two hard things" joke and
  289 others.
- **Console banner** on load pointing at `/llms.txt` and the shortcuts.
- **`theme blueprint`** = ASCII engineering-blueprint theme (grid bg, mono).

### Jokes

`public/jokes.json` (289 curated dev jokes). **Lazy-loaded once on first
trigger, cached in memory** (`loadJokes()`), then indexed. Both the terminal
`joke` command and the footer glyph advance the **same** session rotation
(`sessionStorage['joke-idx']`), seeded at a random offset per session. Four
inline fallbacks cover a failed fetch. This fetch-on-demand pattern is the
template for future terminal content (blogs, games) — keep the bundle a thin
shell and load content from `public/`.

## Roadmap / planned (owner-stated)

- **Blog** (essays grouped by topic, movie reviews) and **games** surfaced
  through the terminal — `ls blog`, `ls games`, etc. Stubs already exist as
  `blog`/`games` terminal commands. Content will live in `public/` JSON and
  load lazily, same as jokes. When real, blog posts should also become **indexed
  pages** (sitemap + JSON-LD) — the terminal is an *alternative* front door, not
  the only one. (Jokes are deliberately excluded from sitemap/llms.txt because
  they're an easter egg, not content — make the opposite call for blogs.)

## SEO / a11y baseline (don't regress)

- One `h1`/page, ordered headings, semantic landmarks, skip link,
  `:focus-visible` rings, `prefers-reduced-motion` everywhere, WCAG-AA contrast.
- Per-page `<title>`/description, canonical (`.html` stripped), OG + Twitter
  tags, JSON-LD (Person, WebSite, ProfilePage, ItemList/SoftwareSourceCode),
  `robots.txt`, auto sitemap. Keep these when adding pages — BaseLayout props
  (`title`, `description`, `jsonLd`, `ogType`) are how you set them.

## Conventions

- Match the surrounding style; keep comment density and naming consistent.
- Reusable components, clean data/presentation split, no unnecessary abstraction.
- Restrained motion only. Whitespace and typography over decoration.
- Commit in small, logically-grouped units. Deploy only when asked.
