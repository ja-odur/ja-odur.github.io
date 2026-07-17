# odurjoseph.com

Personal website of [Joseph Odur](https://www.odurjoseph.com) — senior software
engineer. Built with [Astro](https://astro.build): every page is static HTML,
and the only JavaScript shipped is progressive enhancement (the hero typing,
the "For Machines" mode, and a handful of easter eggs).

## Architecture

```
src/
├── data/          # single source of truth for all content
│   ├── profile.ts     # identity, links, summary
│   ├── experience.ts  # work history
│   ├── projects.ts    # project write-ups
│   ├── skills.ts      # skills, education, interests
│   └── machine.ts     # builds the machine-readable context doc
├── layouts/
│   └── BaseLayout.astro   # SEO head, JSON-LD, nav, footer, overlays
├── components/    # Nav, Footer, Hero, ProjectCard, MachineMode, Terminal
├── pages/         # index, projects, resume, 404, llms.txt endpoint
├── scripts/
│   └── enhance.ts     # machine mode + easter eggs (vanilla TS)
└── styles/
    └── global.css     # design tokens, dark-first
```

Content lives in `src/data/*` — edit those files to update the site. The
machine view (`/llms.txt` and the header toggle) is generated from the same
data, so it can't drift from the human pages.

## Development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview   # serve the production build locally
npm run check     # type-check .astro/.ts files
```

## Deployment

GitHub Pages, same flow as before:

```sh
npm run deploy    # builds and pushes dist/ to the gh-pages branch
```

The custom domain is kept by `public/CNAME`.

## Easter eggs

They wouldn't be easter eggs if the README listed them. Try the terminal in
the footer and type `help`.
