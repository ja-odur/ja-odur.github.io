export interface Project {
  slug: string;
  name: string;
  /** one-line what-it-is */
  tagline: string;
  /** the problem it exists to solve */
  problem: string;
  /** how it's put together */
  build: string;
  stack: string[];
  link: string;
  featured?: boolean;
  /** hooks for easter eggs */
  egg?: 'dlx';
}

export const projects: Project[] = [
  {
    slug: 'puzzled',
    name: 'Puzzled',
    tagline: 'A web-based puzzle platform with a Sudoku solving engine.',
    problem:
      'Solving Sudoku by brute force is easy to write and slow to run. Puzzled treats it properly — as an exact-cover problem — and solves any valid grid instantly.',
    build:
      'A React/TypeScript front end over a GraphQL (Graphene) API, with Python and Go doing the solving, and Postgres and Redis behind them. Fully containerized with Docker. Poker is on the roadmap.',
    stack: ['Python', 'Go', 'TypeScript', 'React', 'GraphQL', 'PostgreSQL', 'Redis', 'Docker'],
    link: 'https://github.com/ja-odur/puzzled',
    featured: true,
    egg: 'dlx',
  },
  {
    slug: 'andrea',
    name: 'Andrea',
    tagline: 'An online code-execution platform.',
    problem:
      'Running other people’s code is the fun part; running it safely is the hard part. Andrea compiles and executes user-submitted code in C++, Go, Node.js, and Python from the browser.',
    build:
      'Django backend orchestrating isolated Docker containers per execution, with a React front end. Sandboxing, resource limits, and language toolchains are handled server-side.',
    stack: ['Python', 'Django', 'React', 'Docker', 'Bash'],
    link: 'https://github.com/ja-odur/andrea-pub',
    featured: true,
  },
  {
    slug: 'django-react-boilerplate',
    name: 'Django–React boilerplate',
    tagline: 'A starter kit for shipping Django + React apps quickly.',
    problem:
      'Every Django-serves-React project starts with the same two days of wiring. This boilerplate is those two days, done once and kept current.',
    build:
      'Django serving a React build with sensible project layout, environment handling via direnv, and a development workflow that works out of the box.',
    stack: ['Python', 'Django', 'React', 'direnv'],
    link: 'https://github.com/ja-odur/django-react-boilerplate',
    featured: true,
  },
  {
    slug: 'introspector',
    name: 'Introspector',
    tagline: 'A Python package that inspects other Python packages.',
    problem:
      'Sometimes you want a package’s documentation, attributes, methods, and signatures without leaving the terminal or opening the source.',
    build:
      'Pure Python, installable with pip. Walks modules with the inspect machinery and presents what it finds in a readable form.',
    stack: ['Python'],
    link: 'https://github.com/ja-odur/introspector',
  },
  {
    slug: 'expand-string',
    name: 'expand-string',
    tagline: 'A tiny PyPI package for string expansion.',
    problem:
      'Expands compact numeric-parenthesis notation — like "ab(2)" — into its full string form. Small, focused, published properly.',
    build:
      'Pure Python with tests, packaged and released on PyPI.',
    stack: ['Python', 'PyPI'],
    link: 'https://pypi.org/project/expand-string/',
  },
  {
    slug: 'website',
    name: 'odurjoseph.com',
    tagline: 'This website.',
    problem:
      'A portfolio should load instantly, read well, and rank — and have at least one feature nobody asked for. Ask it to speak machine.',
    build:
      'Astro static site, zero framework JavaScript, dark-first design system, structured data throughout, deployed to GitHub Pages. Try the “machines” toggle in the header.',
    stack: ['Astro', 'TypeScript', 'CSS', 'GitHub Pages'],
    link: 'https://github.com/ja-odur/ja-odur.github.io',
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
