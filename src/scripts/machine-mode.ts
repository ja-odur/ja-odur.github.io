/**
 * "For Machines" mode — a divider splits the page: human text to its left,
 * and to its right the same page as a language model receives it, every
 * word replaced in place by the token IDs it becomes.
 *
 * How it works:
 * - Each top-level block of the page (main's children and the footer) gets
 *   a "back face": a deep clone, absolutely positioned exactly over the
 *   original, whose text nodes are split into tokens. A token keeps its
 *   original text (visibility: hidden) so the back lays out exactly like the
 *   front; the ID is drawn on top via ::after, sized to fit the word it
 *   replaces. Hovering a token shows the word again.
 * - Both faces are clipped at the divider's x (global.css), so the two
 *   halves meet on the same pixel. The real page is never moved in the DOM —
 *   re-inserting it would restart its CSS animations and break the
 *   scroll-reveal observer.
 * - The back mirrors the live front, synchronously, so the seam never shows
 *   two states at once: a MutationObserver re-tokenizes text changes (the
 *   hero's typing riff types in tokens) and copies class and style changes
 *   (scroll-reveal, the caret, the hero glow) in the same task; CSS
 *   animations on the clones are set to their originals' clocks. Pointer
 *   moves and button clicks on the back are forwarded to the front, so the
 *   glow and the easter eggs keep working; links navigate natively.
 * - Nothing is built until the divider is first approached, so the mode
 *   costs nothing unless used. Backs are client-side only: crawlers and
 *   screen readers get the human page (backs are aria-hidden); /llms.txt is
 *   the real machine-readable document.
 *
 * The tokenizer is illustrative, not a real BPE: common words stay whole,
 * longer words split into deterministic 2–5 character pieces, and IDs are a
 * hash into a cl100k-sized vocabulary. Same text → same IDs, every visit.
 */

interface Face {
  front: HTMLElement;
  back: HTMLElement;
  /** last measured layout box, reapplied when the front's style is mirrored */
  box?: { top: number; left: number; width: number };
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

/** below this, an ID squeezed into its word is unreadable — show the chip only */
const MIN_CONDENSE = 0.3;
let measureCtx: CanvasRenderingContext2D | null = null;

/**
 * Fit each ID to the word it replaces without changing its size: the ID is
 * drawn in the word's own font, size and weight (so the two sides of the
 * divider read at the same scale), and only condensed horizontally when it
 * is wider than the word. Widths are measured in that actual font.
 */
function fit(tokens: HTMLElement[]): void {
  measureCtx ??= document.createElement('canvas').getContext('2d');
  const fonts = new Map<Element, string>();
  const measured = tokens.map((tok) => {
    const parent = tok.parentElement!;
    if (!fonts.has(parent)) {
      const cs = getComputedStyle(parent);
      fonts.set(parent, `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`);
    }
    return [tok.offsetWidth, fonts.get(parent)!] as const;
  });
  tokens.forEach((tok, i) => {
    const [w, font] = measured[i]!;
    if (!w) return; // not laid out (a closed dialog); fitted when it opens
    let natural = tok.dataset.id!.length * 0.6 * parseFloat(font.split(' ')[2] ?? '16');
    if (measureCtx) {
      measureCtx.font = font;
      natural = measureCtx.measureText(tok.dataset.id!).width;
    }
    const condense = Math.min(1, w / natural);
    tok.style.setProperty('--mk-sx', condense.toFixed(3));
    tok.classList.toggle('mk-t--tiny', condense < MIN_CONDENSE);
  });
}

/**
 * Where a block sits in the document, ignoring transforms, to the
 * sub-pixel: a section that hasn't scrolled into view is still slid down by
 * scroll-reveal, and measuring that put its back face 20px low once it
 * settled. That slide is a pure translation, so it is subtracted from the
 * exact rect; any other transform falls back to offset* (whole pixels, which
 * left a visible half-pixel seam on centered columns). Width always comes
 * from computed style — fractional, transform-free, border-box like the
 * back's own width — since a rounded-down width could re-wrap a line.
 */
function layoutBox(el: HTMLElement): { top: number; left: number; width: number } {
  const style = getComputedStyle(el);
  const width = parseFloat(style.width);
  const r = el.getBoundingClientRect();
  const m = style.transform === 'none' ? null : new DOMMatrixReadOnly(style.transform);
  if (!m || (m.is2D && m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1)) {
    return {
      top: r.top + window.scrollY - (m?.f ?? 0),
      left: r.left + window.scrollX - (m?.e ?? 0),
      width,
    };
  }
  let top = 0;
  let left = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) {
    top += n.offsetTop;
    left += n.offsetLeft;
  }
  return { top, left, width };
}

function positionBack(face: Face): void {
  const { front, back, box } = face;
  if (!box) return;
  back.style.top = `${box.top}px`;
  back.style.left = `${box.left}px`;
  back.style.width = `${box.width}px`;
  // the divider is a viewport x; each face clips at that x in its own box
  const left = `${(box.left - window.scrollX).toFixed(2)}px`;
  // the front is observed: writing an unchanged value would mirror its style
  // back here and loop
  if (front.style.getPropertyValue('--mk-left') !== left) front.style.setProperty('--mk-left', left);
  back.style.setProperty('--mk-left', left);
}

function place(): void {
  for (const face of faces) {
    face.box = layoutBox(face.front);
    positionBack(face);
  }
  setSplit(splitAt);
}

/**
 * CSS animations restart on a freshly cloned node; set each back animation
 * to its front twin's clock, so the seam never shows the wave, a fade-in or
 * the caret blink in two different phases.
 */
function syncAnimations(): void {
  if (!document.getAnimations) return;
  for (const anim of document.getAnimations()) {
    if (!(anim instanceof CSSAnimation)) continue;
    const effect = anim.effect as KeyframeEffect | null;
    const target = effect?.target;
    const twin = target && toBack.get(target);
    if (!twin) continue;
    for (const other of twin.getAnimations()) {
      if (other instanceof CSSAnimation && other.animationName === anim.animationName) {
        other.currentTime = anim.currentTime;
      }
    }
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
  // the web font can land after the build and re-wrap a line, shifting every
  // block below it; ResizeObserver only reports while the page renders, so
  // don't rely on it alone
  document.fonts?.ready.then(relayout);
  document.fonts?.addEventListener('loadingdone', relayout); // fonts requested later

  // pointer moves over a back reach its front (the hero's glow follows the
  // pointer on both sides of the line)
  backs.addEventListener('pointermove', (e) => {
    const face = faces.find((f) => f.back.contains(e.target as Node));
    face?.front.dispatchEvent(
      new PointerEvent('pointermove', { clientX: e.clientX, clientY: e.clientY, pointerType: e.pointerType })
    );
  });

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

function onMutations(records: MutationRecord[]): void {
  for (const rec of records) {
    if (rec.type === 'attributes') {
      const el = rec.target as Element;
      const twin = toBack.get(el);
      if (!twin || !rec.attributeName) continue;
      const face = faces.find((f) => f.front === el);
      const isRoot = !!face;
      if (face && rec.attributeName === 'style') {
        // page state rides on the root's style too (the hero's --glow-x/y);
        // copy it, then reapply the back's own placement on top
        face.back.setAttribute('style', el.getAttribute('style') ?? '');
        positionBack(face);
        continue;
      }
      const value = el.getAttribute(rec.attributeName);
      if (value === null) twin.removeAttribute(rec.attributeName);
      else twin.setAttribute(rec.attributeName, value);
      if (isRoot && rec.attributeName === 'class') {
        twin.classList.remove('mk-front');
        twin.classList.add('mk-back');
      }
      if (rec.attributeName === 'class') syncAnimations();
      continue;
    }
    const host = rec.target.nodeType === Node.TEXT_NODE ? rec.target.parentElement : (rec.target as HTMLElement);
    if (host) pending.add(host);
  }
  // in this same task, before the next paint: a frame's lag would show the
  // old text on one side of the seam and the new on the other
  if (pending.size) flush();
}

/** Re-clone and re-tokenize each changed element's children on the back. */
function flush(): void {
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
  syncAnimations();
  updateCount();
}

/* --------------------- live surfaces: terminal, toasts -------------------- */

/**
 * Text outside the page blocks has no back face: the terminal is a modal
 * dialog and toasts (the jokes) come and go. While machine mode is on, their text
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

/* ----------------------------------- ui ----------------------------------- */

const ui = {
  bar: $('#machine-bar'),
  count: $('#machine-count'),
  split: $('#machine-split'),
  source: document.querySelector<HTMLTemplateElement>('#machine-source'),
};

function updateCount(): void {
  if (ui.count) ui.count.textContent = countTokens().toLocaleString('en-US');
}

/* -------------------------------- divider --------------------------------- */

/**
 * The divider is the only control. Docked at the right edge, the whole page
 * is human and nothing is built. Drag it left — or click its handle — and
 * everything right of the line is the page as a language model receives it.
 * "Machine mode" is simply "the divider isn't docked". A click opens it a
 * quarter of the way across the content column (not the viewport, whose
 * outer quarter on a wide screen is empty margin); a click, Esc, or the
 * bar's exit docks it again. The position persists across navigation in
 * sessionStorage['mk-split'] and is cleared on a full reload, like the theme.
 */
const DOCKED = 1;
const STORE = 'mk-split';
/** divider position as a fraction of the content area's width */
let splitAt = DOCKED;
let splitFrame = 0;
/** once the visitor drags or arrow-keys it, resizes keep their fraction */
let splitMoved = false;
let engaged = false;

const viewWidth = () => document.documentElement.clientWidth || window.innerWidth;

/** a quarter of the way across the wide content column (the nav's) */
function splitDefault(): number {
  const column = document.querySelector('.nav-inner')?.getBoundingClientRect();
  if (!column || !viewWidth()) return 0.25;
  return (column.left + column.width * 0.25) / viewWidth();
}

function setSplit(fraction: number): void {
  splitAt = Math.min(DOCKED, Math.max(0, fraction));
  const px = splitAt * viewWidth();
  document.documentElement.style.setProperty('--mk-split', `${px.toFixed(2)}px`);
  if (ui.split) {
    const pct = Math.round(splitAt * 100);
    ui.split.setAttribute('aria-valuenow', String(pct));
    ui.split.setAttribute('aria-valuetext', `${pct}% human-readable`);
    ui.split.classList.toggle('docked', splitAt >= DOCKED);
  }
  setEngaged(splitAt < DOCKED);
}

/** crossing the docked edge turns the token side on or off */
function setEngaged(on: boolean): void {
  if (on === engaged) return;
  engaged = on;
  machineOn = on;
  if (on) {
    build();
    place(); // cheap layout reads; catches any shift since the build
    tokenizeLiveSurfaces();
    syncAnimations();
  }
  document.body.classList.toggle('machine-active', on);
  if (ui.bar) ui.bar.hidden = !on;
  updateCount();
}

function saveSplit(): void {
  try {
    if (!engaged) sessionStorage.removeItem(STORE);
    else sessionStorage.setItem(STORE, splitMoved ? splitAt.toFixed(4) : 'default');
  } catch {
    /* storage unavailable — this page only */
  }
}

/** ease the divider to `to`; a drag or a newer slide cancels it */
function slideSplit(to: number, ms: number): void {
  cancelAnimationFrame(splitFrame);
  if (reducedMotion.matches) {
    setSplit(to);
    saveSplit();
    return;
  }
  const from = splitAt;
  const start = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - start) / ms);
    setSplit(from + (to - from) * (1 - (1 - k) ** 3));
    if (k < 1) splitFrame = requestAnimationFrame(step);
    else saveSplit();
  };
  splitFrame = requestAnimationFrame(step);
}

function openSplit(): void {
  splitMoved = false;
  slideSplit(splitDefault(), 650);
}

function dockSplit(): void {
  slideSplit(DOCKED, 450);
}

function initDivider(): void {
  const handle = ui.split;
  if (!handle) return;
  handle.hidden = false;

  // build ahead of the first drag, so the drag itself never hitches
  handle.addEventListener('pointerenter', build);
  handle.addEventListener('focus', build);

  let drag: { id: number; x: number; moved: boolean } | null = null;
  handle.addEventListener('pointerdown', (e) => {
    cancelAnimationFrame(splitFrame);
    handle.setPointerCapture(e.pointerId);
    drag = { id: e.pointerId, x: e.clientX, moved: false };
    document.body.classList.add('mk-dragging');
  });
  handle.addEventListener('pointermove', (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    if (!drag.moved && Math.abs(e.clientX - drag.x) < 4) return;
    drag.moved = true;
    splitMoved = true;
    setSplit(e.clientX / viewWidth());
  });
  const release = (e: PointerEvent) => {
    if (!drag || drag.id !== e.pointerId) return;
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
    document.body.classList.remove('mk-dragging');
    const wasClick = !drag.moved && e.type === 'pointerup';
    drag = null;
    if (wasClick) {
      if (engaged) dockSplit();
      else openSplit();
    } else {
      saveSplit();
    }
  };
  handle.addEventListener('pointerup', release);
  handle.addEventListener('pointercancel', release);

  handle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (engaged) dockSplit();
      else openSplit();
      return;
    }
    const step = e.shiftKey ? 0.1 : 0.02;
    const moves: Record<string, number> = {
      ArrowLeft: splitAt - step,
      ArrowRight: splitAt + step,
      Home: 0,
      End: DOCKED,
    };
    if (e.key in moves) {
      e.preventDefault();
      cancelAnimationFrame(splitFrame);
      splitMoved = true;
      setSplit(moves[e.key]!);
      saveSplit();
    }
  });

  window.addEventListener(
    'resize',
    () => setSplit(engaged && !splitMoved ? splitDefault() : splitAt),
    { passive: true }
  );
}

export function initMachineMode(toast: (html: string, ms?: number) => void): void {
  watchLiveSurfaces();
  initDivider();

  $('#machine-exit')?.addEventListener('click', dockSplit);
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
    if (e.key === 'Escape' && engaged) dockSplit();
  });

  // restore the divider carried over from the previous page, without motion
  let saved: string | null = null;
  try {
    saved = sessionStorage.getItem(STORE);
    // stale keys from the toggle era
    sessionStorage.removeItem('audience');
    localStorage.removeItem('audience');
  } catch {
    /* ignore */
  }
  if (saved === 'default') {
    setSplit(splitDefault());
  } else if (saved && Number.isFinite(Number(saved))) {
    splitMoved = true;
    setSplit(Number(saved));
  } else {
    setSplit(DOCKED);
  }
  document.documentElement.classList.remove('mk-pending');
}
