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
 * longer words split into deterministic 3–5 character pieces, and IDs are a
 * hash into a cl100k-sized vocabulary, banded by how common the piece is
 * (see tokenId). Same text → same IDs, every visit.
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

/**
 * A plausible ID for a piece. A real BPE vocabulary merges frequent pieces
 * first, so they get small IDs — single characters and punctuation sit in
 * the first few hundred, common words in the low thousands, rare fragments
 * out to ~100k. Mirroring that keeps short tokens' IDs short enough to fit
 * them at the word's own size.
 */
function tokenId(piece: string, lead: string): number {
  const h = hash(lead + piece);
  const code = piece.length === 1 ? piece.charCodeAt(0) : 0;
  // GPT-style byte tokens: printable ASCII "!".."~" are IDs 0–93, so "," is
  // 11 and "." is 13 — the one place these IDs match a real vocabulary
  if (code >= 33 && code <= 126 && !/[\p{L}\p{N}]/u.test(piece)) return code - 33;
  if (!/[\p{L}\p{N}]/u.test(piece)) return 10 + (h % 90); // other symbols (·, —, ’)
  if (piece.length === 1) return 10 + (h % 90); // single characters
  if (COMMON.has(piece.toLowerCase())) return 100 + (h % 1900);
  if (piece.length <= 3) return 1000 + (h % 9000);
  return 10_000 + (h % (VOCAB - 10_000)); // the long tail
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
      let n = whole ? rest.length : 3 + (hash(rest) % 3);
      // no stray one- or two-letter tails: they read as missing tokens and a
      // real merge table rarely ends a word that way
      if (rest.length - n < 3) n = rest.length;
      const part = rest.slice(0, n);
      // like BPE, a leading space is part of the token
      out.push({ text: part, id: tokenId(part, first ? lead : '') });
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

/** Width of a whitespace neighbour on the token's own line, else 0. */
function spaceBeside(node: Node | null, line: number, range: Range): number {
  if (!node || node.nodeType !== Node.TEXT_NODE || !/^\s+$/.test(node.nodeValue ?? '')) return 0;
  range.selectNodeContents(node);
  const r = range.getBoundingClientRect();
  return Math.abs(r.top - line) < 2 ? r.width : 0;
}

/**
 * Fit each ID to the word it replaces without changing its size: the ID is
 * drawn in the word's own font, size and weight (so the two sides of the
 * divider read at the same scale), and only condensed horizontally when it
 * is wider than the word. Widths are measured in that actual font.
 *
 * A token may borrow half of the space on either side of it — never more,
 * so two neighbours' IDs can't meet — which is what lets "a" or "is" carry a
 * readable ID. A token still too narrow (a period ending a paragraph) is
 * laid out with the rest of its word instead: the word's IDs share the
 * word's width in proportion, in order, so "Africa." shows both IDs.
 */
function fit(tokens: HTMLElement[]): void {
  markTokensMoved();
  measureCtx ??= document.createElement('canvas').getContext('2d');
  const fonts = new Map<Element, string>();
  const range = document.createRange();
  const measured = tokens.map((tok) => {
    const parent = tok.parentElement!;
    if (!fonts.has(parent)) {
      const cs = getComputedStyle(parent);
      fonts.set(parent, `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`);
    }
    const r = tok.getBoundingClientRect();
    return {
      x: r.left,
      w: tok.offsetWidth,
      left: spaceBeside(tok.previousSibling, r.top, range) / 2,
      right: spaceBeside(tok.nextSibling, r.top, range) / 2,
      font: fonts.get(parent)!,
    };
  });
  const naturals = tokens.map((tok, i) => {
    const { font } = measured[i]!;
    if (!measureCtx) return tok.dataset.id!.length * 0.6 * parseFloat(font.split(' ')[2] ?? '16');
    measureCtx.font = font;
    return measureCtx.measureText(tok.dataset.id!).width;
  });
  const set = (tok: HTMLElement, condense: number, dx: number) => {
    tok.style.setProperty('--mk-sx', condense.toFixed(3));
    tok.style.setProperty('--mk-dx', `${dx.toFixed(2)}px`);
    tok.classList.toggle('mk-t--tiny', condense < MIN_CONDENSE);
  };

  const tight: number[] = [];
  tokens.forEach((tok, i) => {
    const { w, left, right } = measured[i]!;
    if (!w) return; // not laid out (a closed dialog); fitted when it opens
    const natural = naturals[i]!;
    const condense = Math.min(1, (w + left + right) / natural);
    // centered on its token where it fits; otherwise slid toward the side
    // with spare space
    const over = Math.max(0, natural * condense - w) / 2;
    set(tok, condense, over > left ? over - left : over > right ? right - over : 0);
    if (condense < MIN_CONDENSE) tight.push(i);
  });

  // a word is a run of tokens with no whitespace between them
  const index = new Map(tokens.map((tok, i) => [tok, i]));
  const done = new Set<number>();
  for (const i of tight) {
    if (done.has(i)) continue;
    let first = i;
    let last = i;
    const prevOf = (k: number) => index.get(tokens[k]!.previousSibling as HTMLElement);
    const nextOf = (k: number) => index.get(tokens[k]!.nextSibling as HTMLElement);
    while (prevOf(first) !== undefined) first = prevOf(first)!;
    while (nextOf(last) !== undefined) last = nextOf(last)!;
    const word: number[] = [];
    for (let k: number | undefined = first; k !== undefined; k = k === last ? undefined : nextOf(k)) {
      word.push(k);
      done.add(k);
    }
    if (word.length < 2) continue;
    const start = measured[first]!.x - measured[first]!.left;
    const room = measured[last]!.x + measured[last]!.w + measured[last]!.right - start;
    const need = word.reduce((sum, k) => sum + naturals[k]!, 0);
    const condense = Math.min(1, room / need);
    let x = start + (room - need * condense) / 2;
    for (const k of word) {
      const width = naturals[k]! * condense;
      const center = measured[k]!.x + measured[k]!.w / 2;
      set(tokens[k]!, condense, x + width / 2 - center);
      x += width;
    }
  }
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
  markTokensMoved();
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
  total: $('#machine-total'),
  split: $('#machine-split'),
  source: document.querySelector<HTMLTemplateElement>('#machine-source'),
};

/* ------------------------------- token bar -------------------------------- */

/**
 * The bar counts tokens as the divider converts them — every token on the
 * page whose center is right of the line — and shows only while the divider
 * is moving (drag, keys, a click's slide), lingering BAR_LINGER after it
 * stops, and staying up while the pointer or focus is on it (it holds copy
 * context, /llms.txt and exit). Token x-positions are kept sorted, so each
 * frame of a drag is a binary search; any re-fit or re-place marks them
 * stale and they're re-read once on the next count.
 */
const BAR_LINGER = 2500;
let barTimer = 0;
let tokenXs: number[] = [];
let tokenXsStale = true;

function markTokensMoved(): void {
  tokenXsStale = true;
}

function updateCount(): void {
  if (!backs) return;
  if (tokenXsStale) {
    tokenXs = [...backs.querySelectorAll<HTMLElement>('.mk-t')]
      .map((tok) => {
        const r = tok.getBoundingClientRect();
        return r.left + r.width / 2;
      })
      .sort((a, b) => a - b);
    tokenXsStale = false;
  }
  const line = splitAt * viewWidth();
  let lo = 0;
  let hi = tokenXs.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (tokenXs[mid]! <= line) lo = mid + 1;
    else hi = mid;
  }
  if (ui.count) ui.count.textContent = (tokenXs.length - lo).toLocaleString('en-US');
  if (ui.total) ui.total.textContent = tokenXs.length.toLocaleString('en-US');
}

function showBar(): void {
  if (!ui.bar) return;
  ui.bar.classList.add('shown');
  window.clearTimeout(barTimer);
  barTimer = window.setTimeout(hideBar, BAR_LINGER);
}

function hideBar(): void {
  if (!ui.bar) return;
  if (ui.bar.matches(':hover, :focus-within') || document.body.classList.contains('mk-dragging')) {
    barTimer = window.setTimeout(hideBar, BAR_LINGER);
    return;
  }
  ui.bar.classList.remove('shown');
}

/* -------------------------------- divider --------------------------------- */

/**
 * The divider is the only control. At rest it sits in the empty right
 * margin beside the content column, "humans | machines" labels showing —
 * everything is still left of the line, so the page is plain human and
 * nothing is built. Where the margin can't hold the labels without touching
 * content (phones, narrow windows), it rests at the far edge instead as a
 * compact grip inside the page gutter. Drag it into the content — or click
 * its grip — and everything right of the line is the page as a language
 * model receives it; "machine mode" is simply "the line is over content".
 * A click opens it a quarter of the way across the content column; a click,
 * Esc, or the bar's exit returns it to rest. The position persists across
 * navigation in sessionStorage['mk-split'] and is cleared on a full reload,
 * like the theme.
 */
const STORE = 'mk-split';
/** label offset from the line (0.5rem) plus breathing room from content */
const LABEL_GAP = 20;
/** divider position as a fraction of the content area's width */
let splitAt = 1;
let splitFrame = 0;
/** once the visitor drags or arrow-keys it, resizes keep their fraction */
let splitMoved = false;
let engaged = false;

const viewWidth = () => document.documentElement.clientWidth || window.innerWidth;

/** where the divider rests, and where the content column ends (both px) */
let rest = { x: 0, roomy: false, contentRight: 0 };

/**
 * Pick the resting spot: centered in the right margin if both labels fit
 * there without coming within LABEL_GAP of the content column; otherwise the
 * far edge. Measured from the nav's column, the widest one on every page.
 */
function computeRest(): void {
  const vw = viewWidth();
  const inner = document.querySelector<HTMLElement>('.nav-inner');
  let contentRight = vw;
  if (inner) {
    const r = inner.getBoundingClientRect();
    contentRight = r.right - parseFloat(getComputedStyle(inner).paddingRight);
  }
  const human = ui.split?.querySelector<HTMLElement>('.split-human')?.offsetWidth ?? 0;
  const machine = ui.split?.querySelector<HTMLElement>('.split-machine')?.offsetWidth ?? 0;
  const min = contentRight + human + LABEL_GAP;
  const max = vw - machine - LABEL_GAP;
  const roomy = human > 0 && min <= max;
  rest = {
    x: roomy ? Math.min(max, Math.max(min, (contentRight + vw) / 2)) : vw,
    roomy,
    contentRight,
  };
  ui.split?.classList.toggle('roomy', roomy);
}

const restAt = () => rest.x / viewWidth();

/** a quarter of the way across the wide content column (the nav's) */
function splitDefault(): number {
  const column = document.querySelector('.nav-inner')?.getBoundingClientRect();
  if (!column || !viewWidth()) return 0.25;
  return (column.left + column.width * 0.25) / viewWidth();
}

function setSplit(fraction: number): void {
  splitAt = Math.min(1, Math.max(0, fraction));
  const px = splitAt * viewWidth();
  document.documentElement.style.setProperty('--mk-split', `${px.toFixed(2)}px`);
  if (ui.split) {
    const pct = Math.round(splitAt * 100);
    ui.split.setAttribute('aria-valuenow', String(pct));
    ui.split.setAttribute('aria-valuetext', `${pct}% human-readable`);
  }
  // the token side only matters once the line is over content; in the
  // margin there is nothing to its right, so nothing is built
  const on = px < rest.contentRight - 0.5;
  ui.split?.classList.toggle('at-rest', !on);
  setEngaged(on);
  updateCount();
}

/** the line crossing into the content turns the token side on or off */
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
  showBar();
  slideSplit(splitDefault(), 650);
}

function dockSplit(): void {
  showBar();
  slideSplit(restAt(), 450);
}

function initDivider(): void {
  const handle = ui.split;
  if (!handle) return;
  handle.hidden = false;
  if (ui.bar) {
    ui.bar.hidden = false; // visibility is .shown from here on
    ui.bar.addEventListener('pointerleave', () => {
      window.clearTimeout(barTimer);
      barTimer = window.setTimeout(hideBar, BAR_LINGER);
    });
  }
  computeRest(); // labels have to be laid out to be measured

  // build ahead of the first drag, so the drag itself never hitches
  handle.addEventListener('pointerenter', build);
  handle.addEventListener('focus', build);

  let drag: { id: number; x: number; moved: boolean } | null = null;
  handle.addEventListener('pointerdown', (e) => {
    cancelAnimationFrame(splitFrame);
    handle.setPointerCapture(e.pointerId);
    drag = { id: e.pointerId, x: e.clientX, moved: false };
    document.body.classList.add('mk-dragging');
    build();
    showBar();
  });
  handle.addEventListener('pointermove', (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    if (!drag.moved && Math.abs(e.clientX - drag.x) < 4) return;
    drag.moved = true;
    splitMoved = true;
    setSplit(e.clientX / viewWidth());
    showBar();
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
      End: restAt(),
    };
    if (e.key in moves) {
      e.preventDefault();
      cancelAnimationFrame(splitFrame);
      splitMoved = true;
      build();
      setSplit(moves[e.key]!);
      saveSplit();
      showBar();
    }
  });

  window.addEventListener(
    'resize',
    () => {
      computeRest();
      if (!engaged) setSplit(restAt());
      else setSplit(splitMoved ? splitAt : splitDefault());
    },
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
    setSplit(restAt());
  }
  document.documentElement.classList.remove('mk-pending');
}
