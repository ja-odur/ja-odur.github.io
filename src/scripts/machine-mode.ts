/**
 * "For Machines" mode — the page flips over, in place, to the side a
 * language model receives: the same layout, with every word replaced by
 * the token IDs it becomes.
 *
 * How it works:
 * - Each top-level block of the page (main's children and the footer) gets
 *   a "back face": a deep clone, absolutely positioned over the original,
 *   whose text nodes are split into tokens. A token keeps its original text
 *   (visibility: hidden) so the back lays out exactly like the front; the ID
 *   is drawn on top via ::after, sized to fit the word it replaces. Hovering
 *   a token shows the word again.
 * - Front and back each rotate on their own (perspective() in the transform,
 *   backface-visibility: hidden) rather than inside a shared wrapper, so the
 *   real page is never moved in the DOM — moving it would restart its CSS
 *   animations and break the scroll-reveal observer.
 * - A MutationObserver mirrors the live front onto the back: text changes
 *   are re-tokenized (the hero's typing riff types in tokens) and class
 *   changes are copied (scroll-reveal, the caret's typing state). Button
 *   clicks on the back are forwarded to the front, so the easter eggs still
 *   work; links navigate natively.
 * - Nothing is built until the first flip, so the mode costs nothing unless
 *   used. The back faces are client-side only: crawlers and screen readers
 *   get the human page (backs are aria-hidden); /llms.txt is the real
 *   machine-readable document.
 *
 * The tokenizer is illustrative, not a real BPE: common words stay whole,
 * longer words split into deterministic 2–5 character pieces, and IDs are a
 * hash into a cl100k-sized vocabulary. Same text → same IDs, every visit.
 */

type Audience = 'human' | 'machine';

interface Face {
  front: HTMLElement;
  back: HTMLElement;
}

interface Segment {
  text: string;
  /** undefined for whitespace */
  id?: number;
}

const VOCAB = 100_256;
const COMMON = new Set(
  (
    "the of and to in a an is it for on at by or as be with that this from you your " +
    "i i've i'm me my we our all can can't more about into over under than then " +
    "things side server public years building spent stay pressure systems payment " +
    'project projects resume email work selected contact solve'
  ).split(' ')
);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel);

/* ------------------------------- tokenizer -------------------------------- */

function hash(s: string): number {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function tokenize(text: string): Segment[] {
  const out: Segment[] = [];
  let lead = '';
  for (const [piece] of text.matchAll(/\s+|[\p{L}\p{M}'’]+|\p{N}+|\S/gu)) {
    if (/^\s/.test(piece)) {
      out.push({ text: piece });
      lead = ' ';
      continue;
    }
    const whole = piece.length <= 4 || COMMON.has(piece.toLowerCase()) || !/\p{L}/u.test(piece);
    let rest = piece;
    let first = true;
    while (rest) {
      const n = whole ? rest.length : Math.min(rest.length, 2 + (hash(rest) % 4));
      const part = rest.slice(0, n);
      // like BPE, a leading space is part of the token
      out.push({ text: part, id: hash((first ? lead : '') + part) % VOCAB });
      rest = rest.slice(n);
      first = false;
    }
    lead = '';
  }
  return out;
}

/* ------------------------------ back faces -------------------------------- */

const faces: Face[] = [];
/** front element → its mirror on the back (and the reverse, for clicks) */
const toBack = new WeakMap<Element, HTMLElement>();
const toFront = new WeakMap<Element, HTMLElement>();
let backs: HTMLElement | null = null;
let tint = 0;

const SKIP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'SVG']);

function pairUp(front: Element, back: Element): void {
  const fw = document.createTreeWalker(front, NodeFilter.SHOW_ELEMENT);
  const bw = document.createTreeWalker(back, NodeFilter.SHOW_ELEMENT);
  let f: Node | null = fw.currentNode;
  let b: Node | null = bw.currentNode;
  while (f && b) {
    toBack.set(f as Element, b as HTMLElement);
    toFront.set(b as Element, f as HTMLElement);
    f = fw.nextNode();
    b = bw.nextNode();
  }
}

/** ids would duplicate the front's; focus belongs to the front */
function sanitize(root: HTMLElement): void {
  for (const el of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    el.removeAttribute('id');
    if (el.matches('a, button, input, select, textarea, [tabindex]')) el.tabIndex = -1;
  }
}

/** Split every text node under `root` into token spans; returns the new tokens. */
function tokenizeTree(root: HTMLElement): HTMLElement[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      !node.nodeValue?.trim() ||
      SKIP.has(node.parentElement?.tagName.toUpperCase() ?? '') ||
      node.parentElement?.closest('.mk-t') // already a token (live surfaces re-scan)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  const made: HTMLElement[] = [];
  for (const node of nodes) {
    // one wrapper per text node: inside a flex or grid parent, loose token
    // spans would each become an item and stop wrapping like the text did
    const frag = document.createElement('span');
    frag.className = 'mk-run';
    for (const seg of tokenize(node.nodeValue ?? '')) {
      if (seg.id === undefined) {
        frag.append(seg.text);
        continue;
      }
      const tok = document.createElement('span');
      tok.className = `mk-t mk-t${tint++ % 3}`;
      tok.dataset.id = String(seg.id);
      const word = document.createElement('span');
      word.className = 'mk-x';
      word.textContent = seg.text;
      tok.append(word);
      frag.append(tok);
      made.push(tok);
    }
    node.replaceWith(frag);
  }
  return made;
}

/** Size each ID to the word it replaces: shrink the font, then condense. */
function fit(tokens: HTMLElement[]): void {
  const fontSize = new Map<Element, number>();
  const measured = tokens.map((tok) => {
    const parent = tok.parentElement!;
    if (!fontSize.has(parent)) fontSize.set(parent, parseFloat(getComputedStyle(parent).fontSize));
    return [tok.offsetWidth, fontSize.get(parent)!] as const;
  });
  tokens.forEach((tok, i) => {
    const [w, em] = measured[i]!;
    if (!w) return; // not laid out (a closed dialog); fitted when it opens
    const chars = tok.dataset.id!.length;
    // mono digits are ~0.6em wide; allow condensing to 80% before shrinking
    const size = Math.min(em * 0.62, Math.max(6, w / (chars * 0.6 * 0.8)));
    const condense = Math.min(1, w / (chars * 0.6 * size));
    tok.style.setProperty('--mk-fs', `${size.toFixed(1)}px`);
    tok.style.setProperty('--mk-sx', condense.toFixed(2));
    tok.classList.toggle('mk-t--tiny', condense < 0.5);
  });
}

function place(): void {
  for (const { front, back } of faces) {
    const r = front.getBoundingClientRect();
    back.style.top = `${r.top + window.scrollY}px`;
    back.style.left = `${r.left + window.scrollX}px`;
    back.style.width = `${r.width}px`;
  }
}

function countTokens(): number {
  return backs?.querySelectorAll('.mk-t').length ?? 0;
}

function build(): void {
  if (backs) return;
  backs = document.createElement('div');
  backs.className = 'mk-backs';
  backs.setAttribute('aria-hidden', 'true');

  const blocks = [
    ...document.querySelectorAll<HTMLElement>('#main > *'),
    ...document.querySelectorAll<HTMLElement>('.site-footer'),
  ].filter((el) => !SKIP.has(el.tagName.toUpperCase()));
  for (const front of blocks) {
    const back = front.cloneNode(true) as HTMLElement;
    pairUp(front, back);
    sanitize(back);
    front.classList.add('mk-front');
    back.classList.add('mk-back');
    backs.append(back);
    faces.push({ front, back });
  }
  document.body.append(backs);
  place();
  fit(faces.flatMap(({ back }) => tokenizeTree(back)));

  // keep the back in step with the live page
  const observer = new MutationObserver(onMutations);
  for (const { front } of faces) {
    observer.observe(front, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'data-given'],
    });
  }

  const relayout = () => {
    place();
    fit([...backs!.querySelectorAll<HTMLElement>('.mk-t')]);
  };
  let resizeTimer = 0;
  const ro = new ResizeObserver(() => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(relayout, 80);
  });
  for (const { front } of faces) ro.observe(front);

  // buttons on the back drive their front twins (DLX solve, joke, terminal)
  backs.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest('button');
    const twin = btn && toFront.get(btn);
    if (twin) {
      e.preventDefault();
      twin.click();
    }
  });
}

let pending = new Set<HTMLElement>();
let flushQueued = false;

function onMutations(records: MutationRecord[]): void {
  for (const rec of records) {
    if (rec.type === 'attributes') {
      const el = rec.target as Element;
      const twin = toBack.get(el);
      if (!twin || !rec.attributeName) continue;
      const isRoot = faces.some((f) => f.front === el);
      // roots carry the flip's own inline styles and classes; mirror only page state
      if (isRoot && rec.attributeName === 'style') continue;
      const value = el.getAttribute(rec.attributeName);
      if (value === null) twin.removeAttribute(rec.attributeName);
      else twin.setAttribute(rec.attributeName, value);
      if (isRoot && rec.attributeName === 'class') {
        twin.classList.remove('mk-front');
        twin.classList.add('mk-back');
      }
      continue;
    }
    const host = rec.target.nodeType === Node.TEXT_NODE ? rec.target.parentElement : (rec.target as HTMLElement);
    if (host) pending.add(host);
  }
  if (pending.size && !flushQueued) {
    flushQueued = true;
    requestAnimationFrame(flush);
  }
}

/** Re-clone and re-tokenize each changed element's children on the back. */
function flush(): void {
  flushQueued = false;
  const made: HTMLElement[] = [];
  for (const front of pending) {
    const back = toBack.get(front);
    if (!back || !front.isConnected) continue;
    const copy = front.cloneNode(true) as HTMLElement;
    pairUp(front, copy);
    sanitize(copy);
    // pairUp mapped front → copy; the copy's root stands in for the existing back
    toBack.set(front, back);
    toFront.set(back, front);
    back.replaceChildren(...copy.childNodes);
    made.push(...tokenizeTree(back));
  }
  pending = new Set();
  if (made.length) fit(made);
  updateCount();
}

/* --------------------- live surfaces: terminal, toasts -------------------- */

/**
 * Text outside the page blocks can't flip: the terminal is a modal dialog
 * and toasts (the jokes) come and go. While machine mode is on, their text
 * is tokenized in place instead. Token styling on `.mk-live` is scoped to
 * body.machine-active in global.css, so the same spans read as plain text
 * once you're back in human mode. The terminal's input stays plain on
 * purpose — that's the human typing to the machine; the echoed command in
 * the output is tokenized like everything else it prints.
 */
const terminal = {
  dialog: $('#terminal'),
  output: $('#terminal-output'),
};
let machineOn = false;

function tokenizeLive(root: HTMLElement): void {
  root.classList.add('mk-live');
  const made = tokenizeTree(root);
  if (made.length) fit(made);
}

function tokenizeLiveSurfaces(): void {
  if (terminal.output) tokenizeLive(terminal.output);
  document.querySelectorAll<HTMLElement>('.toast').forEach(tokenizeLive);
}

function watchLiveSurfaces(): void {
  const observer = new MutationObserver((records) => {
    if (!machineOn) return;
    for (const rec of records) {
      if (rec.type === 'attributes') {
        // the dialog just opened: lines tokenized while it was closed had no
        // layout to fit against
        if (terminal.dialog?.hasAttribute('open') && terminal.output) {
          tokenizeLive(terminal.output);
          fit([...terminal.output.querySelectorAll<HTMLElement>('.mk-t')]);
        }
        continue;
      }
      for (const node of rec.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.classList.contains('toast')) tokenizeLive(node);
        else if (terminal.output?.contains(node)) tokenizeLive(terminal.output);
      }
      if (rec.type === 'characterData' && terminal.output?.contains(rec.target)) {
        tokenizeLive(terminal.output);
      }
    }
  });
  observer.observe(document.body, { childList: true });
  if (terminal.output) {
    observer.observe(terminal.output, { childList: true, subtree: true, characterData: true });
  }
  if (terminal.dialog) {
    observer.observe(terminal.dialog, { attributes: true, attributeFilter: ['open'] });
  }
}

/* --------------------------------- flip ----------------------------------- */

const ui = {
  bar: $('#machine-bar'),
  count: $('#machine-count'),
  source: document.querySelector<HTMLTemplateElement>('#machine-source'),
  buttons: [...document.querySelectorAll<HTMLButtonElement>('.mode-switch button')],
};

function updateCount(): void {
  if (ui.count) ui.count.textContent = countTokens().toLocaleString('en-US');
}

/** Rotate each block about the viewport's middle, so tall blocks don't swing. */
function aimRotation(): void {
  const mid = window.innerHeight / 2;
  for (const { front, back } of faces) {
    const y = `${(mid - front.getBoundingClientRect().top).toFixed(0)}px`;
    front.style.setProperty('--mk-oy', y);
    back.style.setProperty('--mk-oy', y);
  }
}

export function setAudience(mode: Audience, animate = true): void {
  const active = mode === 'machine';
  for (const btn of ui.buttons) {
    btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode));
  }
  try {
    // session-scoped like the theme: survives navigation, the <head> script
    // clears it on a full reload
    sessionStorage.setItem('audience', mode);
  } catch {
    /* storage unavailable — this page only */
  }
  machineOn = active;
  if (active) {
    build();
    tokenizeLiveSurfaces();
  }
  if (!backs) return;

  aimRotation();
  const instant = !animate || reducedMotion.matches;
  document.body.classList.toggle('mk-instant', instant);
  if (ui.bar) ui.bar.hidden = !active;
  updateCount();
  if (instant) {
    // no turn to animate: swap now, in the same frame the pending veil lifts
    document.body.classList.toggle('machine-active', active);
  } else {
    // let a freshly built back paint face-down before it turns over
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.body.classList.toggle('machine-active', active))
    );
  }
  document.documentElement.classList.remove('mk-pending');
}

export function initMachineMode(toast: (html: string, ms?: number) => void): void {
  watchLiveSurfaces();
  for (const btn of ui.buttons) {
    btn.addEventListener('click', () => setAudience(btn.dataset.mode as Audience));
  }

  $('#machine-exit')?.addEventListener('click', () => setAudience('human'));
  $('#machine-copy')?.addEventListener('click', async () => {
    const text = (ui.source?.content.textContent ?? '').trim();
    try {
      await navigator.clipboard.writeText(text);
      toast('context copied — <strong>paste it into your favorite model</strong>');
    } catch {
      toast('clipboard unavailable — try <strong>/llms.txt</strong> instead');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('machine-active')) {
      setAudience('human');
    }
  });

  let saved: string | null = null;
  try {
    saved = sessionStorage.getItem('audience');
    localStorage.removeItem('audience'); // stale key from when it persisted forever
  } catch {
    /* ignore */
  }
  if (saved === 'machine') setAudience('machine', false);
}
