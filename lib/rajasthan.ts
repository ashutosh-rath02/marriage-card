// A small Rajasthani decor kit, drawn with the same hand-drawn pen as the rest of the book:
// cusped arches, jharokha windows, battlements, bandhani bands, peacocks, an elephant, a camel,
// paisleys, lotuses and a sun face. Everything takes 0..1 canvas coordinates.

import type { Pt, Sketch } from "./sketch";
import { tint } from "./style";
import { G, roofLift } from "./fold";

export const RAJ = {
  rani: "#e8447f", // rani pink
  maroon: "#a3213f",
  saffron: "#f59a2f",
  turmeric: "#f8c632",
  peacock: "#139c9a",
  indigo: "#3f4fb0",
  emerald: "#31a35f",
  gold: "#e8b84a",
  ivory: "#fff4d8",
  sand: "#f4d9a6", // jaisalmer stone
  clay: "#dc7a4e",
  night: "#27348b",
};

/** Smooth closed/open curve through control points (Catmull-Rom). */
export function curve(ctrl: Pt[], closed = true, steps = 7): Pt[] {
  const n = ctrl.length;
  const out: Pt[] = [];
  const get = (i: number) => (closed ? ctrl[((i % n) + n) % n] : ctrl[Math.max(0, Math.min(n - 1, i))]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    for (let j = 0; j < steps; j++) {
      const t = j / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  if (!closed) out.push(ctrl[n - 1]);
  return out;
}

/** Outline of a cusped (scalloped) arch: straight sides up to `spring`, lobes over the top. */
export function cuspArch(x0: number, x1: number, base: number, spring: number, peak: number, lobes = 5, n = 70): Pt[] {
  const pts: Pt[] = [[x0, base], [x0, spring]];
  const amp = (x1 - x0) * 0.05;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const env = spring - (spring - peak) * (1 - Math.pow(Math.abs(2 * t - 1), 1.9));
    pts.push([x0 + (x1 - x0) * t, env - amp * Math.pow(Math.abs(Math.sin(lobes * Math.PI * t)), 0.7)]);
  }
  pts.push([x1, spring], [x1, base]);
  return pts;
}

const mapPts = (pts: Pt[], f: (p: Pt) => Pt) => pts.map(f);
/** Place unit-space points: scale, mirror (dir = -1) and move. */
const place = (pts: Pt[], x: number, y: number, k: number, dir = 1, rot = 0): Pt[] =>
  mapPts(pts, ([a, b]) => {
    const px = a * dir;
    return [x + (px * Math.cos(rot) - b * Math.sin(rot)) * k, y + (px * Math.sin(rot) + b * Math.cos(rot)) * k];
  });

// ---------------------------------------------------------------------------
// architecture

/** A tiny domed chhatri (pavilion) sitting on (x, y). */
export function chhatri(s: Sketch, x: number, y: number, w: number, c = RAJ.sand, dome = RAJ.ivory) {
  const h = w * 0.55;
  s.sticker(s.rectPts(x - w * 0.42, y - h * 0.5, w * 0.84, h * 0.5), 2, 0.1, tint(c));
  s.box(x - w * 0.42, y - h * 0.5, w * 0.84, h * 0.5, null, { w: 1.5 });
  for (const k of [-0.28, 0, 0.28]) s.line(x + k * w, y - h * 0.5, x + k * w, y, { w: 1.2 });
  const d = s.ellipsePts(x, y - h * 0.5, w * 0.5, h * 0.85, Math.PI, Math.PI * 2, 14);
  s.sticker(d, 2, 0.1, tint(dome));
  s.stroke(d, { closed: true, w: 1.7 });
  s.line(x, y - h * 0.5 - h * 0.85, x, y - h * 0.5 - h * 1.15, { w: 1.5 });
  s.blob(x, y - h * 0.5 - h * 1.2, w * 0.04, w * 0.05, tint(RAJ.gold), { w: 1.2 });
}

/** A carved-stone window (jharokha): cusped arch, lattice (jaali) screen, balcony and dome. */
export function jharokha(s: Sketch, x: number, y: number, w: number, h: number, o: { stone?: string; inner?: string; trim?: string; dome?: boolean } = {}) {
  const stone = o.stone ?? RAJ.sand;
  const inner = o.inner ?? RAJ.indigo;
  const trim = o.trim ?? RAJ.gold;
  const archBase = y + h * 0.78;
  const outer = cuspArch(x, x + w, archBase, y + h * 0.36, y + h * 0.05, 5);
  s.sticker(outer, 4, 0.2, tint(stone));
  s.stroke(outer, { closed: true, w: 2.4 });
  const m = w * 0.1;
  const open = cuspArch(x + m, x + w - m, archBase - 0.005, y + h * 0.4, y + h * 0.12, 5);
  s.shape(open, tint(inner), { w: 1.8 });
  // jaali lattice
  const lx0 = x + m;
  const lx1 = x + w - m;
  const ly1 = archBase - 0.005;
  const ly0 = y + h * 0.4;
  const cols = 6;
  for (let i = 1; i < cols; i++) s.line(lx0 + ((lx1 - lx0) * i) / cols, ly0, lx0 + ((lx1 - lx0) * i) / cols, ly1, { w: 1.1, alpha: 0.55 });
  for (let r = 0; r < 5; r++) {
    const yy = ly0 + ((ly1 - ly0) * (r + 0.5)) / 5;
    s.line(lx0, yy, lx1, yy, { w: 1, alpha: 0.4 });
  }
  for (let i = 0; i < cols; i++)
    for (let r = 0; r < 5; r++) {
      const cx = lx0 + ((lx1 - lx0) * (i + 0.5)) / cols;
      const cy = ly0 + ((ly1 - ly0) * (r + 0.5)) / 5;
      s.circle(cx, cy, (lx1 - lx0) * 0.03, { w: 0.9, alpha: 0.6 });
    }
  s.line(x + w / 2, y + h * 0.1, x + w / 2, y + h * 0.4, { w: 1.2, alpha: 0.5 });
  // balcony: a stone ledge on little brackets
  const by = archBase;
  const ledge = s.rectPts(x - w * 0.08, by, w * 1.16, h * 0.07);
  s.sticker(ledge, 2, 0.16, tint(stone));
  s.stroke(ledge, { closed: true, w: 2 });
  const rail = s.rectPts(x - w * 0.04, by + h * 0.07, w * 1.08, h * 0.15);
  s.sticker(rail, 2, 0.16, tint(stone));
  s.stroke(rail, { closed: true, w: 1.8 });
  const n = 5;
  for (let i = 0; i < n; i++) {
    const cx = x + w * (-0.0 + (1.0 * (i + 0.5)) / n);
    const arc = [[cx - w * 0.075, by + h * 0.22], ...s.ellipsePts(cx, by + h * 0.17, w * 0.075, h * 0.07, Math.PI, Math.PI * 2, 8), [cx + w * 0.075, by + h * 0.22]] as Pt[];
    s.shape(arc, tint(inner), { w: 1.3 });
  }
  for (const k of [-0.06, 1.06]) s.line(x + w * k, by + h * 0.22, x + w * k, by + h * 0.3, { w: 1.6 });
  // a pair of golden finials flanking the arch
  for (const k of [0.0, 1.0]) {
    s.line(x + w * k, y + h * 0.36, x + w * k, y + h * 0.2, { w: 1.6 });
    s.blob(x + w * k, y + h * 0.18, w * 0.04, w * 0.05, tint(trim), { w: 1.3 });
  }
  if (o.dome !== false) chhatri(s, x + w / 2, y + h * 0.03, w * 0.34);
}

/** Fort battlements (kangura) running along the top of a wall. */
export function kangura(s: Sketch, y: number, n: number, h: number, c = RAJ.sand, x0 = 0, x1 = 1) {
  const w = (x1 - x0) / n;
  const pts: Pt[] = [[x0, y + h + 0.03]];
  for (let i = 0; i < n; i++) {
    const a = x0 + i * w;
    pts.push([a + w * 0.08, y + h], [a + w * 0.08, y + h * 0.45], [a + w * 0.5, y], [a + w * 0.92, y + h * 0.45], [a + w * 0.92, y + h]);
  }
  pts.push([x1, y + h + 0.03]);
  s.sticker(pts, 2, 0.14, tint(c));
  s.stroke(pts, { closed: true, w: 2 });
  for (let i = 0; i < n; i++) {
    const a = x0 + i * w;
    s.circle(a + w * 0.5, y + h * 0.62, w * 0.1, { w: 1.1, alpha: 0.8 });
  }
}

// ---------------------------------------------------------------------------
// patterns

/** A band of bandhani (tie-dye): rows of little dot rosettes on a coloured ground. */
export function bandhani(s: Sketch, x: number, y: number, w: number, h: number, ground: string, dot = RAJ.ivory, border = RAJ.gold) {
  s.sticker(s.rectPts(x, y, w, h), 1, 0.1, tint(ground));
  s.box(x, y, w, h, null, { w: 2 });
  const rows = Math.max(1, Math.round(h / 0.034));
  const cols = Math.round(w / 0.036);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const cx = x + (w * (c + 0.5 + (r % 2 ? 0.5 : 0))) / cols;
      const cy = y + (h * (r + 0.5)) / rows;
      if (cx > x + w - 0.008) continue;
      const rr = 0.0045;
      for (const [dx, dy] of [[0, 0], [rr * 2, 0], [-rr * 2, 0], [0, rr * 2], [0, -rr * 2]] as Pt[])
        s.fill(s.ellipsePts(cx + dx, cy + dy, rr, rr, 0, Math.PI * 2, 8), tint(dot), { alpha: 1, jitter: 0 });
    }
  s.line(x, y + h * 0.06, x + w, y + h * 0.06, { w: 1, alpha: 0.5 });
  s.fill(s.rectPts(x, y, w, h * 0.06), tint(border), { alpha: 0.9, jitter: 0 });
  s.fill(s.rectPts(x, y + h * 0.94, w, h * 0.06), tint(border), { alpha: 0.9, jitter: 0 });
}

/** A row of little triangles (a darwaza border) hanging from or standing on a line. */
export function teeth(s: Sketch, x0: number, x1: number, y: number, n: number, size: number, c: string, down = true) {
  const w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const a = x0 + i * w;
    const tri: Pt[] = [[a, y], [a + w, y], [a + w / 2, y + (down ? size : -size)]];
    s.shape(tri, tint(i % 2 ? c : RAJ.gold), { w: 1.4 });
  }
}

/** A paisley (mango motif). */
export function paisley(s: Sketch, x: number, y: number, size: number, rot: number, color: string, inner = RAJ.ivory) {
  const base: Pt[] = [[-0.15, -1], [0.25, -0.72], [0.55, -0.2], [0.5, 0.42], [0.1, 0.85], [-0.4, 0.72], [-0.56, 0.2], [-0.32, -0.26], [-0.05, -0.5], [-0.3, -0.8]];
  const outline = curve(place(base, x, y, size, 1, rot), true, 6);
  s.sticker(outline, 1.5, 0.1, tint(color));
  s.stroke(outline, { closed: true, w: 1.6 });
  const core = curve(place(base.map(([a, b]) => [a * 0.55 + 0.04, b * 0.55 + 0.1] as Pt), x, y, size, 1, rot), true, 6);
  s.fill(core, tint(inner), { alpha: 0.9, jitter: 0 });
  s.stroke(core, { closed: true, w: 1.1, alpha: 0.7 });
  const [cx, cy] = place([[0.05, 0.3]], x, y, size, 1, rot)[0];
  s.circle(cx, cy, size * 0.09, { w: 1.1 });
}

/** A lotus in side view. */
export function lotus(s: Sketch, x: number, y: number, r: number, color = RAJ.rani, rot = 0) {
  const petal = (a: number, len: number, wd: number, c: string) => {
    const base: Pt[] = [[0, 0], [wd, -len * 0.45], [0, -len], [-wd, -len * 0.45]];
    const pts = curve(place(base, x, y, 1, 1, a), true, 6);
    s.sticker(pts, 1.2, 0.08, tint(c));
    s.stroke(pts, { closed: true, w: 1.4 });
  };
  petal(rot - 1.15, r, r * 0.3, color);
  petal(rot + 1.15, r, r * 0.3, color);
  petal(rot - 0.6, r * 1.1, r * 0.34, color);
  petal(rot + 0.6, r * 1.1, r * 0.34, color);
  petal(rot, r * 1.25, r * 0.36, RAJ.rani);
}

/** The sun (Surya) face with rays, a Rajasthani wall-painting favourite. */
export function surya(s: Sketch, x: number, y: number, r: number, c = RAJ.gold) {
  const rays = 20;
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    const a2 = ((i + 0.5) / rays) * Math.PI * 2;
    const a1 = ((i - 0.5) / rays) * Math.PI * 2;
    const tri: Pt[] = [
      [x + Math.cos(a1) * r * 0.95, y + Math.sin(a1) * r * 0.95],
      [x + Math.cos(a) * r * (i % 2 ? 1.28 : 1.5), y + Math.sin(a) * r * (i % 2 ? 1.28 : 1.5)],
      [x + Math.cos(a2) * r * 0.95, y + Math.sin(a2) * r * 0.95],
    ];
    s.shape(tri, tint(i % 2 ? RAJ.saffron : c), { w: 1.3 });
  }
  s.blob(x, y, r, r, tint(c), { w: 2 });
  s.circle(x, y, r * 0.82, { w: 1.1, alpha: 0.7 });
  // face
  s.stroke(s.ellipsePts(x - r * 0.32, y - r * 0.12, r * 0.18, r * 0.1, Math.PI, Math.PI * 2, 8), { w: 1.6 });
  s.stroke(s.ellipsePts(x + r * 0.32, y - r * 0.12, r * 0.18, r * 0.1, Math.PI, Math.PI * 2, 8), { w: 1.6 });
  s.circle(x - r * 0.32, y - r * 0.08, r * 0.04, { w: 1.1 });
  s.circle(x + r * 0.32, y - r * 0.08, r * 0.04, { w: 1.1 });
  s.stroke([[x, y - r * 0.12], [x - r * 0.07, y + r * 0.2], [x + r * 0.04, y + r * 0.22]], { w: 1.4 });
  s.stroke(s.ellipsePts(x, y + r * 0.34, r * 0.3, r * 0.16, 0.15, Math.PI - 0.15, 10), { w: 1.6 });
  s.blob(x, y - r * 0.5, r * 0.07, r * 0.07, tint(RAJ.maroon), { w: 1.2 });
}

/** A hanging brass lantern (kandil) with a warm glow. */
export function kandil(s: Sketch, x: number, y: number, size: number, c = RAJ.gold) {
  s.line(x, y - size * 1.2, x, y, { w: 1.4 });
  s.glow(x, y + size * 0.9, size * 1.6, "#ffcf5a", 0.5);
  const cap: Pt[] = [[x - size * 0.45, y + size * 0.3], [x, y], [x + size * 0.45, y + size * 0.3]];
  s.shape(cap, tint(c), { w: 1.6 });
  const body: Pt[] = [[x - size * 0.45, y + size * 0.3], [x + size * 0.45, y + size * 0.3], [x + size * 0.32, y + size * 1.5], [x - size * 0.32, y + size * 1.5]];
  s.sticker(body, 1.5, 0.12, tint("#ffe9a8"));
  s.stroke(body, { closed: true, w: 1.6 });
  for (const k of [-0.15, 0.15]) s.line(x + size * k, y + size * 0.3, x + size * k * 0.75, y + size * 1.5, { w: 1, alpha: 0.7 });
  s.line(x - size * 0.4, y + size * 0.9, x + size * 0.4, y + size * 0.9, { w: 1, alpha: 0.7 });
  s.shape([[x - size * 0.32, y + size * 1.5], [x + size * 0.32, y + size * 1.5], [x, y + size * 1.85]], tint(c), { w: 1.4 });
  s.blob(x, y + size * 1.95, size * 0.07, size * 0.1, tint(RAJ.maroon), { w: 1.2 });
}

// ---------------------------------------------------------------------------
// animals

/** A peacock with its tail fanned open. (x, y) = feet on the ground, `size` = body height. */
export function peacock(s: Sketch, x: number, y: number, size: number, dir = 1) {
  const bx = x;
  const by = y - size * 0.34;
  const fan = 0.62 * size;
  const feathers = 13;
  for (let i = 0; i < feathers; i++) {
    const a = -Math.PI * 0.96 + (i / (feathers - 1)) * Math.PI * 0.92;
    const len = fan * (i % 2 ? 0.92 : 1);
    const lw = size * 0.085;
    const base: Pt[] = [[0, 0], [lw, -len * 0.5], [0, -len], [-lw, -len * 0.5]];
    const f = curve(place(base, bx - dir * size * 0.02, by - size * 0.02, 1, 1, a + Math.PI / 2), true, 6);
    s.sticker(f, 1, 0.06, tint(i % 2 ? RAJ.peacock : RAJ.emerald));
    s.stroke(f, { closed: true, w: 1.2, alpha: 0.9 });
    const [ex, ey] = [bx - dir * size * 0.02 + Math.cos(a) * len * 0.8, by - size * 0.02 + Math.sin(a) * len * 0.8];
    s.blob(ex, ey, size * 0.055, size * 0.07, tint(RAJ.gold), { w: 1 });
    s.blob(ex, ey, size * 0.03, size * 0.04, tint(RAJ.indigo), { w: 0.9 });
  }
  // legs
  s.line(bx - size * 0.03, by + size * 0.1, bx - size * 0.05, y, { w: 1.6 });
  s.line(bx + size * 0.04, by + size * 0.1, bx + size * 0.05, y, { w: 1.6 });
  // body and neck
  const bodyPts = curve(
    [
      [bx - dir * size * 0.16, by + size * 0.04],
      [bx - dir * size * 0.02, by + size * 0.13],
      [bx + dir * size * 0.14, by + size * 0.07],
      [bx + dir * size * 0.17, by - size * 0.1],
      [bx + dir * size * 0.2, by - size * 0.27],
      [bx + dir * size * 0.17, by - size * 0.36],
      [bx + dir * size * 0.1, by - size * 0.28],
      [bx + dir * size * 0.08, by - size * 0.12],
      [bx - dir * size * 0.05, by - size * 0.1],
    ],
    true,
    6,
  );
  s.sticker(bodyPts, 1.2, 0.08, tint(RAJ.indigo));
  s.stroke(bodyPts, { closed: true, w: 1.7 });
  const bell = s.ellipsePts(bx + dir * size * 0.13, by - size * 0.02, size * 0.05, size * 0.1);
  s.fill(bell, tint(RAJ.peacock), { alpha: 0.9, jitter: 0 });
  // head, crest and beak
  const hx = bx + dir * size * 0.17;
  const hy = by - size * 0.4;
  s.blob(hx, hy, size * 0.05, size * 0.045, tint(RAJ.indigo), { w: 1.4 });
  for (const k of [-0.5, 0, 0.5]) {
    s.line(hx, hy - size * 0.04, hx + k * size * 0.05, hy - size * 0.12, { w: 1.1 });
    s.circle(hx + k * size * 0.055, hy - size * 0.125, size * 0.012, { w: 1 });
  }
  s.stroke([[hx + dir * size * 0.045, hy - size * 0.005], [hx + dir * size * 0.1, hy + size * 0.015], [hx + dir * size * 0.045, hy + size * 0.025]], { w: 1.4, closed: true });
  s.circle(hx + dir * size * 0.02, hy - size * 0.008, size * 0.008, { w: 1.1 });
}

/** A tapered ribbon along a centre line (for trunks and necks). */
function thick(center: Pt[], w0: number, w1: number): Pt[] {
  const c = curve(center, false, 8);
  const left: Pt[] = [];
  const right: Pt[] = [];
  c.forEach((p, i) => {
    const q = c[Math.min(i + 1, c.length - 1)];
    const o = c[Math.max(i - 1, 0)];
    const dx = q[0] - o[0];
    const dy = q[1] - o[1];
    const l = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * (i / (c.length - 1))) / 2;
    left.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]);
    right.push([p[0] + (dy / l) * w, p[1] - (dx / l) * w]);
  });
  return [...left, ...right.reverse()];
}

/** A fringe of little gold tassels hanging from the given points. */
function tassels(s: Sketch, pts: Pt[], len: number, mask = false) {
  for (const [px, py] of pts) {
    s.line(px, py, px, py + len, { w: 1.1, mask });
    s.blob(px, py + len * 1.2, len * 0.28, len * 0.34, tint(RAJ.gold), { w: 1, mask });
  }
}

type Part = [Pt[], boolean];
/** One closed silhouette from alternating smooth (curved) and straight runs of points. */
const outline = (parts: Part[]): Pt[] => parts.flatMap(([pts, smooth]) => (smooth ? curve(pts, false, 6) : pts));

/** Draw a flat shape the way the animals are painted: paper sticker, optional pop-up mask, pen outline. */
function painted(s: Sketch, pts: Pt[], color: string | null, mask: boolean, w = 1.8, halo = 1) {
  if (color) {
    s.sticker(pts, halo, 0.1, color);
    if (mask) s.maskFill(pts);
  } else if (mask) s.maskFill(pts);
  s.stroke(pts, { closed: true, w, mask });
}

/** A caparisoned elephant (side view). (x, y) = ground under its middle, `size` = body length. */
export function elephant(s: Sketch, x: number, y: number, size: number, dir = 1, mask = false) {
  const skin = tint("#c6bec8");
  const dark = tint("#a69eae");
  const Q = (pts: Pt[]) => place(pts, x, y, size, dir);
  const one = (p: Pt) => Q([p])[0];
  const leg = (c: number, shade: string) => Q([[c - 0.07, -0.3], [c + 0.07, -0.3], [c + 0.07, 0], [c - 0.07, 0]]);
  // the whole animal as one silhouette: back, head, trunk curling forward, four legs
  const body = outline([
    [[[-0.45, -0.62], [-0.3, -0.72], [-0.05, -0.75], [0.15, -0.73], [0.27, -0.81], [0.36, -0.9], [0.48, -0.87], [0.55, -0.75], [0.58, -0.6], [0.64, -0.44], [0.66, -0.24], [0.62, -0.09], [0.55, -0.03], [0.5, -0.08], [0.54, -0.22], [0.52, -0.38], [0.47, -0.5], [0.4, -0.44], [0.37, -0.32]], true],
    [[[0.37, -0.03], [0.37, 0], [0.23, 0], [0.23, -0.03], [0.23, -0.26]], false],
    [[[0.23, -0.26], [0.2, -0.29], [0.17, -0.26]], true],
    [[[0.17, -0.03], [0.17, 0], [0.03, 0], [0.03, -0.03], [0.03, -0.26]], false],
    [[[0.03, -0.26], [-0.05, -0.29], [-0.13, -0.26]], true],
    [[[-0.13, -0.03], [-0.13, 0], [-0.27, 0], [-0.27, -0.03], [-0.27, -0.26]], false],
    [[[-0.27, -0.26], [-0.29, -0.28], [-0.31, -0.26]], true],
    [[[-0.31, -0.03], [-0.31, 0], [-0.45, 0], [-0.45, -0.03], [-0.45, -0.3]], false],
    [[[-0.45, -0.3], [-0.5, -0.42], [-0.5, -0.55], [-0.45, -0.62]], true],
  ]);
  painted(s, Q(body), skin, mask, 2.2);
  // the far legs a shade darker
  for (const c of [-0.2, 0.1]) s.fill(leg(c, dark), dark, { alpha: 0.55, jitter: 0, mask });
  // tail
  s.stroke(curve(Q([[-0.49, -0.54], [-0.55, -0.42], [-0.53, -0.3]]), false, 6), { w: 1.8, mask });
  s.blob(...(one([-0.53, -0.27]) as Pt), size * 0.015, size * 0.03, dark, { w: 1.2, mask });
  // ear, eye and tusk
  painted(s, curve(Q([[0.18, -0.78], [0.32, -0.8], [0.37, -0.62], [0.31, -0.46], [0.2, -0.5], [0.15, -0.64]]), true, 6), dark, mask, 1.5, 0.5);
  s.circle(...(one([0.47, -0.73]) as Pt), size * 0.013, { w: 1.6, mask });
  s.fill(Q([[0.5, -0.74], [0.54, -0.74], [0.52, -0.7]]), tint("#8a7f8e"), { alpha: 0.5, jitter: 0, mask });
  painted(s, Q(thick([[0.55, -0.6], [0.66, -0.56], [0.71, -0.46]], 0.04, 0.008)), tint("#fffaf0"), mask, 1.4, 0.5);
  // painted forehead with jewels, and gold bands on the trunk
  s.fill(curve(Q([[0.34, -0.89], [0.46, -0.86], [0.53, -0.74], [0.57, -0.6], [0.5, -0.65], [0.45, -0.77], [0.37, -0.84]]), true, 5), tint(RAJ.rani), { alpha: 0.95, jitter: 0, mask });
  for (const [a, b] of [[0.4, -0.86], [0.46, -0.82], [0.5, -0.75]] as Pt[]) s.blob(...(one([a, b]) as Pt), size * 0.011, size * 0.011, tint(RAJ.gold), { w: 1, mask });
  for (const [yy, x0, x1] of [[-0.4, 0.5, 0.645], [-0.28, 0.53, 0.655], [-0.16, 0.53, 0.645]] as [number, number, number][])
    s.fill(Q([[x0, yy], [x1, yy - 0.012], [x1, yy + 0.02], [x0, yy + 0.03]]), tint(RAJ.gold), { alpha: 1, jitter: 0, mask });
  // anklets
  for (const c of [-0.38, -0.2, 0.1, 0.3]) s.fill(Q([[c - 0.07, -0.1], [c + 0.07, -0.1], [c + 0.07, -0.06], [c - 0.07, -0.06]]), tint(RAJ.gold), { alpha: 1, jitter: 0, mask });
  // the jhool (embroidered blanket) with a scalloped hem, a gold stripe and medallions
  const hem: Pt[] = [];
  for (let k = 0; k <= 8; k++) hem.push([0.2 - k * 0.0775, k % 2 ? -0.3 : -0.35]);
  const jhool = curve(Q([[-0.44, -0.58], [-0.32, -0.71], [-0.05, -0.745], [0.14, -0.72], [0.2, -0.6], ...hem, [-0.45, -0.46]]), true, 4);
  painted(s, jhool, tint(RAJ.maroon), mask, 1.8, 0.6);
  s.fill(Q([[-0.43, -0.54], [0.2, -0.54], [0.2, -0.49], [-0.44, -0.49]]), tint(RAJ.gold), { alpha: 1, jitter: 0, mask });
  for (const [mx, my] of [[-0.28, -0.6], [-0.05, -0.64], [0.13, -0.62]] as Pt[]) {
    s.blob(...(one([mx, my]) as Pt), size * 0.05, size * 0.05, tint(RAJ.gold), { w: 1.2, mask });
    s.circle(...(one([mx, my]) as Pt), size * 0.02, { w: 1, mask });
  }
  tassels(s, Q([[-0.38, -0.33], [-0.26, -0.3], [-0.14, -0.33], [-0.02, -0.3], [0.1, -0.33], [0.18, -0.32]]), size * 0.04, mask);
  // howdah: a gold platform, a rani seat under a golden onion dome
  painted(s, Q([[-0.31, -0.745], [0.12, -0.745], [0.12, -0.78], [-0.31, -0.78]]), tint(RAJ.gold), mask, 1.6, 0.5);
  painted(s, Q([[-0.27, -0.78], [0.08, -0.78], [0.08, -0.87], [-0.27, -0.87]]), tint(RAJ.rani), mask, 1.6, 0.5);
  for (const px of [-0.25, -0.1, 0.06]) s.line(...(one([px, -0.87]) as Pt), ...(one([px, -0.95]) as Pt), { w: 1.3, mask });
  painted(s, curve(Q([[-0.32, -0.95], [-0.3, -1.0], [-0.2, -1.05], [-0.1, -1.15], [0.0, -1.05], [0.1, -1.0], [0.12, -0.95]]), false, 6), tint(RAJ.gold), mask, 1.6, 0.5);
  s.line(...(one([-0.1, -1.15]) as Pt), ...(one([-0.1, -1.21]) as Pt), { w: 1.4, mask });
  s.blob(...(one([-0.1, -1.23]) as Pt), size * 0.014, size * 0.014, tint(RAJ.maroon), { w: 1, mask });
}

/** A saddled camel (side view). (x, y) = ground under its middle, `size` = body length. */
export function camel(s: Sketch, x: number, y: number, size: number, dir = 1, mask = false) {
  const skin = tint("#ebc88f");
  const dark = tint("#d2ad74");
  const Q = (pts: Pt[]) => place(pts, x, y, size, dir);
  const one = (p: Pt) => Q([p])[0];
  const legPts = (c: number): Pt[] => [[c + 0.05, -0.42], [c + 0.032, -0.2], [c + 0.036, -0.04], [c + 0.055, 0], [c - 0.045, 0], [c - 0.032, -0.04], [c - 0.03, -0.2], [c - 0.05, -0.42]];
  const body = outline([
    [[[-0.42, -0.6], [-0.35, -0.72], [-0.27, -0.92], [-0.13, -1.02], [0.01, -0.93], [0.08, -0.74], [0.18, -0.72], [0.28, -0.82], [0.35, -0.98], [0.41, -1.12], [0.47, -1.22], [0.57, -1.27], [0.67, -1.23], [0.75, -1.16], [0.78, -1.1], [0.72, -1.06], [0.62, -1.08], [0.52, -1.05], [0.46, -0.95], [0.43, -0.82], [0.4, -0.68], [0.38, -0.55]], true],
    [legPts(0.31), false],
    [[[0.265, -0.42], [0.245, -0.445], [0.225, -0.42]], true],
    [legPts(0.18), false],
    [[[0.135, -0.42], [0.0, -0.46], [-0.155, -0.43]], true],
    [legPts(-0.2), false],
    [[[-0.245, -0.42], [-0.265, -0.44], [-0.285, -0.42]], true],
    [legPts(-0.33), false],
    [[[-0.375, -0.42], [-0.42, -0.5], [-0.42, -0.6]], true],
  ]);
  painted(s, Q(body), skin, mask, 2.2);
  for (const c of [0.18, -0.2]) s.fill(Q(legPts(c)), dark, { alpha: 0.5, jitter: 0, mask });
  for (const c of [0.31, 0.18, -0.2, -0.33]) s.fill(Q([[c - 0.05, -0.09], [c + 0.05, -0.09], [c + 0.052, -0.055], [c - 0.052, -0.055]]), tint(RAJ.gold), { alpha: 1, jitter: 0, mask });
  // tail
  s.stroke(curve(Q([[-0.41, -0.62], [-0.5, -0.52], [-0.5, -0.36]]), false, 6), { w: 1.8, mask });
  s.blob(...(one([-0.5, -0.33]) as Pt), size * 0.016, size * 0.03, dark, { w: 1.1, mask });
  // head details: ear, eye, nostril, bridle
  painted(s, curve(Q([[0.49, -1.25], [0.46, -1.35], [0.54, -1.31]]), true, 5), dark, mask, 1.2, 0.4);
  s.circle(...(one([0.62, -1.19]) as Pt), size * 0.012, { w: 1.5, mask });
  s.circle(...(one([0.765, -1.11]) as Pt), size * 0.007, { w: 1.1, mask });
  s.stroke(Q([[0.52, -1.14], [0.64, -1.14], [0.73, -1.1]]), { w: 1.2, alpha: 0.8, mask });
  s.blob(...(one([0.56, -1.12]) as Pt), size * 0.015, size * 0.015, tint(RAJ.gold), { w: 1, mask });
  // saddle blanket: rani pink, gold stripe, medallions, tassels
  const hem: Pt[] = [];
  for (let k = 0; k <= 6; k++) hem.push([0.2 - k * 0.097, k % 2 ? -0.4 : -0.45]);
  painted(s, curve(Q([[-0.38, -0.62], [-0.3, -0.71], [0.1, -0.71], [0.2, -0.64], [0.2, -0.52], ...hem, [-0.4, -0.52]]), true, 4), tint(RAJ.rani), mask, 1.8, 0.6);
  s.fill(Q([[-0.39, -0.58], [0.2, -0.58], [0.2, -0.53], [-0.4, -0.53]]), tint(RAJ.turmeric), { alpha: 1, jitter: 0, mask });
  for (const mx of [-0.25, -0.08, 0.1]) s.blob(...(one([mx, -0.65]) as Pt), size * 0.028, size * 0.028, tint(RAJ.gold), { w: 1.1, mask });
  tassels(s, Q([[-0.35, -0.42], [-0.24, -0.45], [-0.13, -0.42], [-0.02, -0.45], [0.09, -0.42], [0.18, -0.44]]), size * 0.04, mask);
  // a rani cap with a tassel on the hump, and a gold garland and bell on the neck
  painted(s, curve(Q([[-0.2, -0.93], [-0.12, -1.0], [-0.04, -0.93], [-0.12, -0.88]]), true, 5), tint(RAJ.rani), mask, 1.4, 0.4);
  s.line(...(one([-0.12, -1.0]) as Pt), ...(one([-0.12, -1.05]) as Pt), { w: 1.3, mask });
  s.blob(...(one([-0.12, -1.07]) as Pt), size * 0.014, size * 0.014, tint(RAJ.gold), { w: 1, mask });
  for (const [gx, gy] of [[0.33, -0.86], [0.37, -0.96], [0.41, -1.06]] as Pt[]) s.blob(...(one([gx, gy]) as Pt), size * 0.022, size * 0.022, tint(RAJ.gold), { w: 1.1, mask });
  s.blob(...(one([0.42, -0.78]) as Pt), size * 0.032, size * 0.032, tint(RAJ.turmeric), { w: 1.3, mask });
}

/** Colour a hex a touch darker (for the far legs). */
function shadeHex(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(v * 0.9);
  return `#${((ch((n >> 16) & 255) << 16) | (ch((n >> 8) & 255) << 8) | ch(n & 255)).toString(16).padStart(6, "0")}`;
}

/** Scatter of marigold petals, soft and sparse (used instead of confetti). */
export function scatter(s: Sketch, n: number, x0 = 0.05, x1 = 0.95, y0 = 0.05, y1 = 0.95) {
  const cols = [RAJ.saffron, RAJ.turmeric, RAJ.rani];
  for (let i = 0; i < n; i++) {
    const x = x0 + s.r() * (x1 - x0);
    const y = y0 + s.r() * (y1 - y0);
    const p = s.ellipsePts(x, y, 0.008, 0.005);
    s.sticker(p, 0.5, 0, tint(cols[i % 3]));
    s.stroke(p, { closed: true, w: 1 });
  }
}

/** A floor mandala (rangoli / dhurrie) made of petals, dots and a star in the middle. */
export function mandala(s: Sketch, cx: number, cy: number, r: number, cols: string[] = [RAJ.rani, RAJ.saffron, RAJ.turmeric, RAJ.peacock]) {
  const rings: [number, number, number][] = [
    [1.0, 28, 0.085],
    [0.8, 22, 0.1],
    [0.6, 16, 0.115],
    [0.4, 12, 0.13],
  ];
  rings.forEach(([f, n, sz], ri) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + ri * 0.2;
      const base: Pt[] = [[0, 0], [sz * r * 0.55, -sz * r * 1.4], [0, -sz * r * 2.6], [-sz * r * 0.55, -sz * r * 1.4]];
      const pts = curve(place(base, cx + Math.cos(a) * r * f, cy + Math.sin(a) * r * f, 1, 1, a + Math.PI / 2 + Math.PI), true, 4);
      s.sticker(pts, 0.5, 0, tint(cols[(k + ri) % cols.length]));
      s.stroke(pts, { closed: true, w: 1 });
    }
  });
  s.stroke(s.ellipsePts(cx, cy, r * 1.18, r * 1.18), { closed: true, w: 1.4 });
  s.blob(cx, cy, r * 0.18, r * 0.18, tint(RAJ.gold), { w: 1.4 });
  s.star(cx, cy, r * 0.13, { w: 1.2 });
}

/**
 * The painted crown of a wall: the arch above the wall gets a trim of gold dots that follows the
 * scallops, a medallion (sun face or lotus) and a pair of paisleys. Art y runs negative here.
 */
export function crown(s: Sketch, kind: "sun" | "lotus" = "sun", accent = RAJ.rani) {
  const edge = (t: number, k = 0.86) => -G * roofLift(t) * k;
  // an inner line following the arch, like a painted frame
  const line: Pt[] = [[0.07, 0.02]];
  for (let i = 0; i <= 48; i++) {
    const t = 0.07 + (0.86 * i) / 48;
    line.push([t, edge(t, 0.8) + 0.02 * (1 - roofLift(t))]);
  }
  line.push([0.93, 0.02]);
  s.stroke(line, { w: 1.6, alpha: 0.8 });
  // gold dots on a second line just inside it
  for (let i = 0; i <= 22; i++) {
    const t = 0.1 + (0.8 * i) / 22;
    const [x, y] = [t, edge(t, 0.7) + 0.02];
    s.blob(x, y, 0.007, 0.007, tint(i % 2 ? RAJ.gold : accent), { w: 1 });
  }
  if (kind === "sun") surya(s, 0.5, -0.17, 0.085);
  else {
    lotus(s, 0.5, -0.045, 0.16, accent);
    s.blob(0.5, -0.255, 0.012, 0.012, tint(RAJ.gold), { w: 1.2 });
  }
  paisley(s, 0.25, -0.09, 0.045, 0.9, accent);
  paisley(s, 0.75, -0.09, 0.045, -0.9, accent);
  for (const [x, y] of [[0.34, -0.2], [0.66, -0.2], [0.17, -0.03], [0.83, -0.03]] as Pt[]) s.star(x, y, 0.016, { w: 1.2 });
}

/** A quarter fan of petals growing out of a corner (sx, sy = ±1 point it into the page). */
export function cornerFan(s: Sketch, x: number, y: number, r: number, sx: number, sy: number, c1 = RAJ.rani, c2 = RAJ.maroon) {
  const n = 7;
  for (let k = 0; k < n; k++) {
    const a = ((k + 0.5) / n) * (Math.PI / 2);
    const dx = Math.cos(a) * sx;
    const dy = Math.sin(a) * sy;
    const nx = -dy;
    const ny = dx;
    const w = r * 0.17;
    const petal = curve([[x, y], [x + dx * r * 0.5 + nx * w, y + dy * r * 0.5 + ny * w], [x + dx * r, y + dy * r], [x + dx * r * 0.5 - nx * w, y + dy * r * 0.5 - ny * w]], true, 6);
    s.sticker(petal, 0.8, 0.05, tint(k % 2 ? c2 : c1));
    s.stroke(petal, { closed: true, w: 1.2 });
  }
  const arc = s.ellipsePts(x, y, r * 1.1, r * 1.1, 0, Math.PI * 2, 40).filter(([px, py]) => (px - x) * sx >= -1e-6 && (py - y) * sy >= -1e-6);
  s.stroke(arc, { w: 1.4 });
  for (let k = 0; k <= 8; k++) {
    const a = (k / 8) * (Math.PI / 2);
    s.blob(x + Math.cos(a) * sx * r * 1.22, y + Math.sin(a) * sy * r * 1.22, r * 0.035, r * 0.035, tint(RAJ.gold), { w: 1 });
  }
  s.blob(x, y, r * 0.1, r * 0.1, tint(RAJ.gold), { w: 1.2 });
}

/** A line of alternating gold and accent dots, the cover's inner frame. */
export function dotLine(s: Sketch, x0: number, y0: number, x1: number, y1: number, n: number, accent = RAJ.rani) {
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    s.blob(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 0.0075, 0.0075, tint(i % 2 ? RAJ.gold : accent), { w: 1 });
  }
}
