/**
 * Progressive enhancement for odurjoseph.com.
 * The site is fully usable with JavaScript disabled; everything in this file
 * is either the "For Machines" mode or an easter egg.
 */

// machine mode lives in its own module: the divider, tokenizer, and live mirror
import { initMachineMode } from './machine-mode';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const $ = <T extends HTMLElement>(sel: string) =>
  document.querySelector<T>(sel);

/* ----------------------------- toast helper ------------------------------ */

let toastTimer: number | undefined;

function toast(html: string, ms = 3600): void {
  document.querySelector('.toast')?.remove();
  window.clearTimeout(toastTimer);
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = html;
  document.body.append(el);
  toastTimer = window.setTimeout(() => el.remove(), ms);
}

/* -------------------------------- jokes ---------------------------------- */

/** Shared by the terminal `joke` command and the footer trigger — every
 *  trigger advances the same rotation (position persisted for the session).
 *  The collection lives in /jokes.json, fetched once on first use and kept
 *  in memory. Blog and game content will follow the same pattern: the
 *  bundle stays a thin shell; content loads on demand. */
const FALLBACK_JOKES: string[] = [
  'There are only two hard things in computer science:\n  1. cache invalidation\n  2. naming things\n  3. off-by-one errors',
  'Why do programmers prefer dark mode?\nBecause light attracts bugs.',
  'It’s not DNS.\nThere’s no way it’s DNS.\nIt was DNS.',
  '404: jokes.json not found.\nHow fitting.',
];

let jokes: string[] | null = null;
let jokesRequest: Promise<string[]> | null = null;

function loadJokes(): Promise<string[]> {
  if (jokes) return Promise.resolve(jokes);
  jokesRequest ??= fetch('/jokes.json')
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then((data: unknown) => {
      const list = Array.isArray(data)
        ? data.filter((j): j is string => typeof j === 'string' && j.length > 0)
        : [];
      jokes = list.length ? list : FALLBACK_JOKES;
      return jokes;
    })
    .catch(() => (jokes = FALLBACK_JOKES));
  return jokesRequest;
}

async function nextJoke(): Promise<string> {
  const list = await loadJokes();
  let idx: number;
  try {
    const stored = sessionStorage.getItem('joke-idx');
    // seed each session at a random offset so visitors don't always get joke #1
    idx = stored === null
      ? Math.floor(Math.random() * list.length)
      : Number(stored) % list.length;
    if (!Number.isInteger(idx) || idx < 0) idx = 0;
    sessionStorage.setItem('joke-idx', String(idx + 1));
  } catch {
    idx = Math.floor(Math.random() * list.length);
  }
  return list[idx]!;
}

/* -------------------------------- themes --------------------------------- */

type ThemeName = 'dark' | 'blueprint' | 'light';

const THEMES: ThemeName[] = ['dark', 'blueprint', 'light'];

/** Sticks across page navigations (sessionStorage), resets on full reload —
 *  the head inline script clears the key when navigation.type === 'reload'. */
function setTheme(name: ThemeName): void {
  if (name === 'dark') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = name;
  }
  try {
    if (name === 'dark') sessionStorage.removeItem('theme');
    else sessionStorage.setItem('theme', name);
  } catch {
    /* storage unavailable — theme applies to this page only */
  }
}

/* ------------------------------ terminal --------------------------------- */

const YEAR_ZERO = 2016;

function termStats(): string {
  const now = new Date();
  const years = now.getFullYear() - YEAR_ZERO;
  const days = Math.floor((now.getTime() - Date.UTC(YEAR_ZERO, 5, 1)) / 86400000);
  const coffee = (days * 2.4).toFixed(0); // deterministic, obviously scientific
  return [
    `<span class="t-accent">engineering stats</span> — audited by nobody`,
    `  years_coding............ ${years}`,
    `  coffee_consumed......... ${coffee} cups <span class="t-dim">(±1 significant figure)</span>`,
    `  production_incidents.... survived all of them`,
    `  prs_reviewed............ many <span class="t-dim">(all with kindness)</span>`,
    `  apis_built.............. REST, GraphQL, and one regrettable SOAP`,
    `  uptime.................. 99.99% <span class="t-dim">— the 0.01% builds character</span>`,
  ].join('\n');
}

function initTerminal(): void {
  const dialog = document.querySelector<HTMLDialogElement>('#terminal');
  const output = $('#terminal-output');
  const form = document.querySelector<HTMLFormElement>('#terminal-form');
  const input = document.querySelector<HTMLInputElement>('#terminal-input');
  if (!dialog || !output || !form || !input) return;

  const print = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    output.append(div);
    output.scrollTop = output.scrollHeight;
  };

  const printSequence = async (lines: string[], delay = 350) => {
    input.disabled = true;
    for (const line of lines) {
      print(line);
      if (!reducedMotion.matches) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    input.disabled = false;
    input.focus();
  };

  const open = () => {
    if (dialog.open) return;
    dialog.showModal();
    void loadJokes(); // warm the joke cache while the visitor types
    if (output.childElementCount === 0) {
      print(`<span class="t-dim">welcome to odur's terminal. type <span class="t-accent">help</span> to look around.</span>`);
    }
    input.focus();
  };

  const maxBtn = $('#terminal-max');

  const setFull = (on: boolean) => {
    dialog.classList.toggle('full', on);
    if (maxBtn) {
      maxBtn.textContent = on ? '⤡' : '⤢';
      maxBtn.setAttribute(
        'aria-label',
        on ? 'Exit fullscreen terminal' : 'Enter fullscreen terminal'
      );
    }
    input.focus();
  };

  $('#terminal-open')?.addEventListener('click', open);
  $('#terminal-close')?.addEventListener('click', () => dialog.close());
  maxBtn?.addEventListener('click', () => setFull(!dialog.classList.contains('full')));
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close(); // click on backdrop
  });

  // esc steps down: fullscreen → window first, then a second esc closes
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialog.classList.contains('full')) {
      e.preventDefault();
      setFull(false);
    }
  });

  // backup for browsers that fire cancel without a preceding keydown
  dialog.addEventListener('cancel', (e) => {
    if (dialog.classList.contains('full')) {
      e.preventDefault();
      setFull(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    const typing =
      e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
    if (e.key === '`' && !typing && !dialog.open) {
      e.preventDefault();
      open();
    }
  });

  const commands: Record<string, () => void | Promise<void>> = {
    help: () =>
      print(
        [
          `<span class="t-accent">available commands</span>`,
          `  whoami                        who runs this place`,
          `  stats                         engineering stats (lightly audited)`,
          `  sudo hire odur                start the hiring pipeline`,
          `  theme dark|light|blueprint    pick a theme (sticks until you hard-reload)`,
          `  fullscreen                    toggle fullscreen terminal`,
          `  joke                          the two hard things`,
          `  clear                         clear the screen`,
          `  exit                          close the terminal`,
          `<span class="t-dim">  tab completes, ↑/↓ walk history. there are shortcuts too —</span>`,
          `<span class="t-dim">  shift+d, shift+p, and one famous code.</span>`,
        ].join('\n')
      ),
    whoami: () =>
      print(
        `Joseph Odur — senior software engineer. backend by conviction, frontend by necessity <span class="t-dim">(confidence: 0.62)</span>.`
      ),
    stats: () => print(termStats()),
    joke: async () => print((await nextJoke()).replace(/</g, '&lt;')),
    clear: () => {
      output.innerHTML = '';
    },
    exit: () => dialog.close(),
    'hire odur': () =>
      print(
        `<span class="t-warn">permission denied:</span> hiring requires elevated privileges. try <span class="t-accent">sudo hire odur</span>`
      ),
    hire: () =>
      print(
        `<span class="t-warn">permission denied:</span> hiring requires elevated privileges. try <span class="t-accent">sudo hire odur</span>`
      ),
    'sudo hire odur': () =>
      printSequence([
        `[sudo] password for visitor: <span class="t-dim">••••••••</span>`,
        `authenticating... <span class="t-ok">ok</span>`,
        `locating candidate \`odur\`... <span class="t-ok">found</span> <span class="t-dim">(Kampala, UTC+3)</span>`,
        `checking backend expertise... <span class="t-ok">verified</span> <span class="t-dim">(payments, APIs, distributed systems)</span>`,
        `compiling offer... <span class="t-ok">done</span>`,
        `<span class="t-ok">┌──────────────────────────────┐\n│       ACCESS GRANTED         │\n└──────────────────────────────┘</span>`,
        `opening secure channel → <a href="mailto:odurjoseph8@gmail.com?subject=We%20ran%20sudo%20hire%20odur">odurjoseph8@gmail.com</a>`,
      ]),
    'theme blueprint': () => {
      setTheme('blueprint');
      print(`<span class="t-accent">blueprint mode engaged.</span> measure twice, deploy once.`);
    },
    'theme light': () => {
      setTheme('light');
      print(`let there be light. <span class="t-dim">(easy on the retinas, hard on the battery)</span>`);
    },
    'theme dark': () => {
      setTheme('dark');
      print(`back to the dark. as nature intended.`);
    },
    theme: () =>
      print(`usage: theme <span class="t-accent">${THEMES.join('|')}</span>`),
    fullscreen: () => {
      const full = !dialog.classList.contains('full');
      setFull(full);
      print(
        full
          ? `terminal maximized. <span class="t-dim">esc or ⤢ to shrink.</span>`
          : `back to a window.`
      );
    },
    ls: () =>
      print(
        `projects  resume  llms.txt  <span class="t-dim">easter-eggs/  blog/  games/</span>`
      ),
    'ls easter-eggs': () => print(`<span class="t-dim">nice try. they don't list themselves.</span>`),
    blog: () =>
      print(
        `<span class="t-dim">blog/ is being written — essays, topic deep-dives, movie reviews. check back soon.</span>`
      ),
    games: () =>
      print(
        `<span class="t-dim">games/ is under construction. the sudoku solver is warming up.</span>`
      ),
    pwd: () => print(`/home/odur/website`),
    'rm -rf /': () => print(`<span class="t-warn">no.</span> we practice blameless post-mortems here, not pre-mortems.`),
  };

  const history: string[] = [];
  let historyIdx = -1; // -1 = live input

  const run = () => {
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;
    history.push(raw);
    historyIdx = -1;
    print(`<span class="t-accent">❯</span> ${raw.replace(/</g, '&lt;')}`);
    const normalized = raw.toLowerCase().replace(/\s+/g, ' ');
    const cmd = commands[normalized];
    if (cmd) {
      void cmd();
    } else if (normalized.startsWith('theme ')) {
      print(`unknown theme. usage: theme <span class="t-accent">${THEMES.join('|')}</span>`);
    } else {
      print(`<span class="t-warn">command not found:</span> ${raw.replace(/</g, '&lt;')} <span class="t-dim">— try \`help\`</span>`);
    }
  };

  const complete = () => {
    const prefix = input.value.trimStart().toLowerCase();
    if (!prefix) return;
    const matches = Object.keys(commands)
      .filter((c) => c.startsWith(prefix) && c !== prefix)
      .sort();
    if (matches.length === 1) {
      input.value = matches[0]!;
    } else if (matches.length > 1) {
      print(`<span class="t-dim">${matches.join('   ')}</span>`);
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run();
  });

  // implicit form submission is unreliable inside <dialog>; handle keys directly
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      historyIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      input.value = history[historyIdx]!;
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      historyIdx += 1;
      if (historyIdx >= history.length) {
        historyIdx = -1;
        input.value = '';
      } else {
        input.value = history[historyIdx]!;
      }
    }
  });
}

/* --------------------------- keyboard shortcuts -------------------------- */

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

function initShortcuts(): void {
  let konamiIdx = 0;

  document.addEventListener('keydown', (e) => {
    const typing =
      e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
    if (typing) return;

    // Konami — developer mode
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    konamiIdx = key === KONAMI[konamiIdx] ? konamiIdx + 1 : key === KONAMI[0] ? 1 : 0;
    if (konamiIdx === KONAMI.length) {
      konamiIdx = 0;
      const on = document.body.classList.toggle('dev-mode');
      toast(
        on
          ? '<strong>developer mode</strong> — implementation notes visible. same code again to exit.'
          : 'developer mode disabled.'
      );
    }

    if (!e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;

    // some input methods report 'd' + shiftKey instead of 'D'
    const shortcut = e.key.toUpperCase();

    if (shortcut === 'D') {
      const on = document.body.classList.toggle('show-grid');
      toast(on ? '<strong>design grid</strong> — 12 columns, 8px baseline.' : 'grid off.');
    }

    if (shortcut === 'P') togglePerfPanel();
  });
}

/* ---------------------------- perf panel (⇧P) ---------------------------- */

let lcpValue = 0;

try {
  new PerformanceObserver((list) => {
    const last = list.getEntries().at(-1);
    if (last) lcpValue = last.startTime;
  }).observe({ type: 'largest-contentful-paint', buffered: true });
} catch {
  /* unsupported browser — panel will show n/a */
}

function togglePerfPanel(): void {
  const existing = document.querySelector('.perf-panel');
  if (existing) {
    existing.remove();
    return;
  }

  const nav = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const transferred =
    (nav?.transferSize ?? 0) + resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const jsBytes = resources
    .filter((r) => r.initiatorType === 'script')
    .reduce((sum, r) => sum + (r.transferSize || 0), 0);

  const fmtMs = (v?: number) => (v && v > 0 ? `${v.toFixed(0)} ms` : 'n/a');
  const fmtKb = (v: number) => (v > 0 ? `${(v / 1024).toFixed(1)} kB` : 'n/a');

  const panel = document.createElement('aside');
  panel.className = 'perf-panel';
  panel.setAttribute('role', 'status');
  panel.innerHTML = `
    <h2>this page, measured</h2>
    <table>
      <tr><td>DOM content loaded</td><td>${fmtMs(nav?.domContentLoadedEventEnd)}</td></tr>
      <tr><td>load</td><td>${fmtMs(nav?.loadEventEnd)}</td></tr>
      <tr><td>largest paint</td><td>${fmtMs(lcpValue)}</td></tr>
      <tr><td>transferred</td><td>${fmtKb(transferred)}</td></tr>
      <tr><td>of which JS</td><td>${fmtKb(jsBytes)}</td></tr>
      <tr><td>DOM nodes</td><td>${document.querySelectorAll('*').length}</td></tr>
    </table>`;
  document.body.append(panel);
}

/* ------------------------------ footer joke ------------------------------ */

function initJoke(): void {
  $('#joke-trigger')?.addEventListener('click', () => {
    void nextJoke().then((joke) => {
      const html = joke.replace(/</g, '&lt;').replace(/\n/g, '<br>');
      toast(html, 6500);
    });
  });
}

/* ------------------------- dlx egg (projects page) ------------------------ */

function initDlxEgg(): void {
  const egg = $('#dlx-egg');
  const grid = egg?.querySelectorAll<HTMLElement>('.dlx-cell');
  if (!egg || !grid?.length) return;

  // the givens rendered by ProjectCard must agree with this
  const solution = ['5', '3', '4', '6', '7', '8', '9', '1', '2'];
  // only the blanks get solved; givens stay as printed
  const blanks = [...grid].flatMap((cell, i) => (cell.dataset.given ? [] : [i]));
  let running = false;

  egg.addEventListener('click', () => {
    if (running) return;
    running = true;
    for (const i of blanks) {
      grid[i]!.textContent = '';
      grid[i]!.classList.remove('solved');
    }

    if (reducedMotion.matches) {
      for (const i of blanks) {
        grid[i]!.textContent = solution[i]!;
        grid[i]!.classList.add('solved');
      }
      toast('<strong>Algorithm X</strong> — exact cover via dancing links. Knuth, 2000.', 4600);
      running = false;
      return;
    }

    let step = 0;
    const timer = window.setInterval(() => {
      if (step >= blanks.length) {
        window.clearInterval(timer);
        toast('<strong>Algorithm X</strong> — exact cover via dancing links. Knuth, 2000.', 4600);
        running = false;
        return;
      }
      const idx = blanks[step]!;
      const cell = grid[idx]!;
      // a couple of "candidate" flickers before the real value lands
      let flick = 0;
      const flicker = window.setInterval(() => {
        if (flick > 2) {
          window.clearInterval(flicker);
          cell.textContent = solution[idx]!;
          cell.classList.add('solved');
          return;
        }
        cell.textContent = String(((idx + flick * 3) % 9) + 1);
        flick += 1;
      }, 45);
      step += 1;
    }, 140);
  });
}

/* ---------------------------- reveal on scroll ---------------------------- */

function initScrollReveal(): void {
  const els = [...document.querySelectorAll<HTMLElement>('.scroll-reveal')];
  if (!els.length) return;
  if (reducedMotion.matches) {
    for (const el of els) el.classList.add('in-view');
    return;
  }

  let pending = new Set(els);
  let ticking = false;

  const check = () => {
    ticking = false;
    // reveal once the section's top clears the bottom ~8% of the viewport
    const threshold = window.innerHeight * 0.92 || Infinity;
    for (const el of pending) {
      if (el.getBoundingClientRect().top < threshold) {
        el.classList.add('in-view');
        pending.delete(el);
      }
    }
    if (!pending.size) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      setTimeout(check, 40);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
}

/* ------------------------------ console note ----------------------------- */

function consoleBanner(): void {
  const accent = 'color:#4cc9e0;font-family:monospace';
  const dim = 'color:#71808e;font-family:monospace';
  console.log(
    '%c~/odur %c— you read consoles. excellent.\n' +
      '%cthe machine-readable version of this site lives at /llms.txt\n' +
      'shortcuts: ` (terminal) · shift+D (grid) · shift+P (metrics) · one famous code',
    accent, 'color:inherit', dim
  );
}

/* --------------------------------- boot ---------------------------------- */

initMachineMode(toast);
initTerminal();
initShortcuts();
initJoke();
initDlxEgg();
initScrollReveal();
consoleBanner();
