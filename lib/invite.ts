// The wedding invite: one pop-up room per event, drawn with the same pen as the journal rooms.
// Each room has an invite card pinned on its right wall (clickable: it opens the details).

import type { Pt, Sketch } from "./sketch";
import { isoLayers, WHITE, type Iso } from "./iso";
import { look, tint } from "./style";
import type { Room } from "./rooms";
import { F, almondLeaf, fairyLights, flower, soft, sparkle, tapedPhoto, tiles } from "./rooms";
import { WEDDING, fmtDay, fmtTime, getGuest, type WeddingEvent } from "./wedding";
import { RAJ, bandhani, camel, chhatri, cuspArch, elephant, jharokha, kandil, kangura, lotus, mandala, paisley, peacock, scatter, surya, teeth } from "./rajasthan";

const MARIGOLD = ["#f4a43b", "#f7c948", "#f08a3c"];
const LEAF = "#a9d98f";
const GOLD = "#ecc15c";
const CREAM = "#fffaf0";

const ev = (key: string) => WEDDING.events.find((e) => e.key === key) as WeddingEvent;

// ---------------------------------------------------------------------------
// decorations

/** A string of marigolds sagging between two points. */
function garland(s: Sketch, x1: number, x2: number, y: number, sag = 0.05, r = 0.014) {
  const n = Math.max(6, Math.round((x2 - x1) / (r * 1.5)));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([x1 + (x2 - x1) * t, y + Math.sin(t * Math.PI) * sag]);
  }
  s.stroke(pts, { w: 1.4 });
  pts.forEach(([x, yy], i) => {
    const c = MARIGOLD[i % MARIGOLD.length];
    s.blob(x, yy, r, r * 0.9, tint(c), { w: 1.3 });
    s.circle(x, yy, r * 0.35, { w: 1, alpha: 0.6 });
  });
  almondLeaf(s, x1 + 0.012, y + 0.03, r * 1.6, 0.2, LEAF);
  almondLeaf(s, x2 - 0.012, y + 0.03, r * 1.6, -0.2, LEAF);
}

/** Vertical strands of marigolds (laris) hanging from y0, each ending in a little tassel. */
function laris(s: Sketch, xs: number[], y0: number, len: number, r = 0.013) {
  xs.forEach((x, k) => {
    const L = len * (0.8 + ((k * 37) % 5) * 0.06);
    s.line(x, y0, x, y0 + L, { w: 1.2 });
    for (let y = y0 + r; y < y0 + L; y += r * 1.7) s.blob(x, y, r, r * 0.85, tint(MARIGOLD[(k + Math.round(y * 97)) % 3]), { w: 1.2 });
    s.stroke(
      [
        [x - 0.008, y0 + L + 0.03],
        [x, y0 + L],
        [x + 0.008, y0 + L + 0.03],
      ],
      { w: 1.3 },
    );
  });
}

/** A row of mango leaves hanging from a cord (toran). */
function toran(s: Sketch, x1: number, x2: number, y: number) {
  s.line(x1, y, x2, y, { w: 2 });
  for (let x = x1 + 0.025; x < x2 - 0.01; x += 0.045) {
    almondLeaf(s, x, y + 0.035, 0.03, 0, LEAF);
    s.blob(x + 0.022, y + 0.01, 0.009, 0.009, tint(MARIGOLD[0]), { w: 1.1 });
  }
}

/** A small clay lamp with a flame. */
function diya(s: Sketch, x: number, y: number, w = 0.05) {
  if (look.color) s.glow(x, y - w * 0.6, w * 1.6, "#ffcf5a", 0.55);
  const bowl: Pt[] = [[x - w / 2, y - w * 0.2], ...s.ellipsePts(x, y - w * 0.2, w / 2, w * 0.35, 0, Math.PI, 12), [x + w / 2, y - w * 0.2]];
  s.sticker(bowl, 2, 0.12, tint("#e9a07c"));
  s.stroke(bowl, { closed: true, w: 1.7 });
  const flame: Pt[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = (i / 10) * Math.PI * 2;
    flame.push([x + Math.sin(t) * w * 0.16, y - w * 0.55 - Math.cos(t) * w * 0.32 - (Math.cos(t) < 0 ? w * 0.18 * -Math.cos(t) : 0)]);
  }
  s.sticker(flame, 1, 0, tint("#ffd56b"));
  s.stroke(flame, { closed: true, w: 1.4 });
}

/** A cusped arch (mehrab) in gold and maroon behind a card, like a niche in a haveli wall. */
function archFrame(s: Sketch, x: number, y: number, w: number, h: number, fillC = RAJ.maroon) {
  const pad = 0.045;
  const outer = cuspArch(x - pad, x + w + pad, y + h + pad, y + h * 0.3, y - pad * 2.6, 5);
  s.sticker(outer, 4, 0.2, tint(fillC));
  s.stroke(outer, { closed: true, w: 2.4 });
  const inner = cuspArch(x - pad * 0.45, x + w + pad * 0.45, y + h + pad * 0.5, y + h * 0.3, y - pad * 1.3, 5);
  s.stroke(inner, { closed: true, w: 1.4, alpha: 0.8 });
  s.fill(inner, tint(RAJ.gold), { alpha: 0.55, jitter: 0 });
  chhatri(s, x + w / 2, y - pad * 2.7, w * 0.2);
}

/** The invite card pinned on a wall; clicking it opens the details. */
function inviteCard(s: Sketch, e: WeddingEvent, x: number, y: number, w: number, h: number, accent: string) {
  const card = s.rectPts(x, y, w, h);
  s.sticker(card, 6, 0.24, tint(CREAM));
  s.mark("invite", card);
  s.stroke(card, { closed: true, w: 2.6 });
  s.fill(s.rectPts(x + 0.015, y + 0.015, w - 0.03, h - 0.03), tint(accent), { alpha: 0.35, jitter: 0 });
  s.rect(x + 0.015, y + 0.015, w - 0.03, h - 0.03, { w: 1.3 });
  for (const [cx, cy] of [
    [x + 0.015, y + 0.015],
    [x + w - 0.015, y + 0.015],
    [x + 0.015, y + h - 0.015],
    [x + w - 0.015, y + h - 0.015],
  ])
    flower(s, cx, cy, 0.01, accent);
  const cx = x + w / 2;
  s.text(e.name, cx, y + h * 0.2, 0.065, { family: "Yatra One" });
  s.text(e.tagline, cx, y + h * 0.36, 0.03, { weight: 500 });
  s.line(cx - w * 0.25, y + h * 0.46, cx + w * 0.25, y + h * 0.455, { w: 1.4 });
  s.text(fmtDay(e.start), cx, y + h * 0.58, 0.046);
  s.text(fmtTime(e.start), cx, y + h * 0.7, 0.04, { weight: 500 });
  s.text(e.venue, cx, y + h * 0.84, 0.03, { weight: 500 });
  // little pin
  s.blob(cx, y + 0.005, 0.012, 0.012, tint("#f6a99a"), { w: 1.6 });
}

/** Framed photo of the couple (two little stick portraits). */
function couplePhoto(s: Sketch, x: number, y: number, w: number, h: number, rot = 0) {
  tapedPhoto(s, x, y, w, h, rot);
  s.stroke(s.ellipsePts(x + w * 0.34, y + h * 0.88, w * 0.16, h * 0.2, Math.PI, Math.PI * 2, 10), { w: 1.4 });
  s.circle(x + w * 0.34, y + h * 0.5, w * 0.09, { w: 1.3 });
  s.circle(x + w * 0.62, y + h * 0.42, w * 0.07, { w: 1.3 });
}

function wash(s: Sketch, c: string) {
  if (look.color) s.washAll(tint(c), 1);
}

/** Petals scattered over a floor. */
function petals(s: Sketch, n: number, colors = MARIGOLD) {
  for (let i = 0; i < n; i++) {
    const x = 0.08 + s.r() * 0.84;
    const y = 0.08 + s.r() * 0.84;
    const p = s.ellipsePts(x, y, 0.008, 0.005);
    s.sticker(p, 0.5, 0, tint(colors[i % colors.length]));
    s.stroke(p, { closed: true, w: 1 });
  }
}

/** Soft cushion seen from above as an iso box with rounded look. */
function cushion(iso: Iso, x: number, y: number, size: number, color: string) {
  iso.box(x, y, 0, size, size, 0.05, WHITE, { color });
  iso.at([x + size / 2, y + size / 2, 0.05], (s, [px, py], u) => s.circle(px, py, 0.008 * u, { w: 1.4, mask: true }));
}

// ---------------------------------------------------------------------------
// the rooms

const HALDI = { wall: "#ffe9a3", floor: "#f9e8bd", accent: "#f7d77a", wood: "#e2c49a", brass: "#f0cf6e", paste: "#f6c445", water: "#cfe6f2", pot: "#e9a07c", cushion: "#f7a8a0" };

/** A long banana leaf with a midrib and side veins, growing from (x, y). */
function bananaLeaf(s: Sketch, x: number, y: number, len: number, ang: number, w = 0.045, onCard = false) {
  const dx = Math.sin(ang);
  const dy = -Math.cos(ang);
  const nx = -dy;
  const ny = dx;
  const side = (sgn: number) =>
    Array.from({ length: 11 }, (_, i) => {
      const t = i / 10;
      const bulge = Math.sin(t * Math.PI) * w * (t < 0.5 ? 1 : 0.85);
      return [x + dx * len * t + nx * bulge * sgn, y + dy * len * t + ny * bulge * sgn + t * t * len * 0.12] as Pt;
    });
  const pts: Pt[] = [...side(1), ...side(-1).reverse()];
  if (onCard) s.shape(pts, tint(LEAF), { mask: true, w: 1.4 });
  else {
    s.sticker(pts, 2, 0.12, tint(LEAF));
    s.stroke(pts, { closed: true, w: 1.6 });
  }
  const rib = side(0);
  s.stroke(rib, { w: 1.2, mask: onCard });
  for (let i = 2; i < 9; i++) {
    const [px, py] = rib[i];
    for (const sgn of [1, -1]) s.line(px, py, px + (nx * sgn + dx * 0.5) * w * 0.7, py + (ny * sgn + dy * 0.5) * w * 0.7 + 0.004, { w: 0.9, alpha: 0.7, mask: onCard });
  }
}

/** A yellow haldi handprint. */
function handprint(s: Sketch, x: number, y: number, r: number, rot: number) {
  const c = Math.cos(rot);
  const sn = Math.sin(rot);
  const at = (dx: number, dy: number): Pt => [x + dx * c - dy * sn, y + dx * sn + dy * c];
  const c0 = tint(HALDI.paste);
  s.blob(...at(0, 0), r, r * 1.1, c0, { w: 1.2 });
  const fingers: [number, number, number][] = [
    [-0.75, -1.5, 0.5],
    [-0.25, -1.85, 0.55],
    [0.25, -1.8, 0.55],
    [0.7, -1.45, 0.48],
    [1.25, -0.2, 0.45],
  ];
  for (const [fx, fy, fr] of fingers) s.blob(...at(fx * r, fy * r), r * fr * 0.55, r * fr, c0, { w: 1.1 });
}

const haldi: Room = {
  name: "haldi",
  mood: ev("haldi").tagline,
  left(s) {
    wash(s, HALDI.wall);
    // a fringe of marigold strands over a mango-leaf toran, under a darwaza border
    teeth(s, 0, 1, 0.03, 14, 0.035, RAJ.maroon);
    laris(s, Array.from({ length: 19 }, (_, i) => 0.04 + i * 0.05), 0.1, 0.17, 0.012);
    toran(s, 0.0, 1.0, 0.09);
    // a carved jharokha with diyas on its balcony, a peacock on each side
    jharokha(s, 0.3, 0.26, 0.4, 0.6, { inner: RAJ.peacock });
    garland(s, 0.34, 0.66, 0.36, 0.05, 0.011);
    diya(s, 0.5, 0.726, 0.06);
    diya(s, 0.4, 0.728, 0.04);
    diya(s, 0.6, 0.728, 0.04);
    peacock(s, 0.14, 0.9, 0.3, 1);
    peacock(s, 0.86, 0.9, 0.3, -1);
    bandhani(s, 0, 0.9, 1, 0.09, RAJ.saffron);
    // handprints left by the guests
    for (const [x, y, r] of [
      [0.08, 0.3, 0.2],
      [0.13, 0.42, -0.3],
      [0.9, 0.28, 0.35],
      [0.86, 0.4, -0.1],
    ])
      handprint(s, x, y, 0.017, r);
  },
  right(s) {
    wash(s, HALDI.wall);
    teeth(s, 0, 1, 0.03, 14, 0.035, RAJ.maroon);
    toran(s, 0.0, 1.0, 0.09);
    laris(s, [0.05, 0.1, 0.15, 0.85, 0.9, 0.95], 0.1, 0.5);
    archFrame(s, 0.28, 0.2, 0.44, 0.46, RAJ.maroon);
    inviteCard(s, ev("haldi"), 0.28, 0.2, 0.44, 0.46, HALDI.accent);
    garland(s, 0.28, 0.72, 0.18, 0.03, 0.011);
    lotus(s, 0.2, 0.86, 0.075, RAJ.rani, -0.15);
    lotus(s, 0.8, 0.86, 0.075, RAJ.rani, 0.15);
    paisley(s, 0.35, 0.8, 0.06, 0.5, RAJ.saffron);
    paisley(s, 0.65, 0.8, 0.06, -0.5, RAJ.saffron);
    bandhani(s, 0, 0.9, 1, 0.09, RAJ.saffron);
    for (const [x, y, r] of [
      [0.2, 0.62, 0.3],
      [0.8, 0.58, -0.35],
    ])
      handprint(s, x, y, 0.016, r);
  },
  floor(s) {
    if (look.color) s.washAll(tint(HALDI.floor), 1);
    tiles(s, 8, 0.3);
    // a rangoli of marigold petals with a diya at its heart
    const [cx, cy] = F(0.7, 0.7);
    mandala(s, cx, cy, 0.15, [MARIGOLD[2], MARIGOLD[1], "#f7a8a0", MARIGOLD[0]]);
    s.shadow([F(0.28, 0.24), F(0.46, 0.24), F(0.46, 0.7), F(0.28, 0.7)], 0.2, 14);
    s.shadow(s.ellipsePts(...F(0.7, 0.14), 0.1, 0.06), 0.2, 12);
    petals(s, 50);
  },
  popups: isoLayers([
    (iso) => {
      // banana plant in a clay pot in the corner
      iso.cyl(0.09, 0.09, 0, 0.05, 0.09, WHITE, { r2: 0.06, color: HALDI.pot });
      iso.at([0.09, 0.09, 0.09], (s, [x, y], u) => {
        for (const [ang, len] of [
          [-0.7, 0.3],
          [-0.2, 0.36],
          [0.3, 0.33],
          [0.8, 0.26],
        ])
          bananaLeaf(s, x, y, len * u, ang, 0.035 * u, true);
      });
      // basket of marigolds by the left wall
      iso.cyl(0.1, 0.78, 0, 0.07, 0.07, WHITE, { r2: 0.09, color: HALDI.wood });
      iso.at([0.1, 0.78, 0.07], (s, [x, y], u) => {
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          s.blob(x + Math.cos(a) * 0.05 * u, y + Math.sin(a) * 0.025 * u - 0.012 * u, 0.02 * u, 0.017 * u, tint(MARIGOLD[k % 3]), { w: 1.3, mask: true });
        }
        s.blob(x, y - 0.02 * u, 0.02 * u, 0.017 * u, tint(MARIGOLD[1]), { w: 1.3, mask: true });
      });
      // a brass urli by the right wall, with flowers floating in it
      iso.cyl(0.7, 0.14, 0, 0.06, 0.05, WHITE, { r2: 0.1, color: HALDI.brass });
      iso.disc(0.7, 0.14, 0.05, 0.085, tint(HALDI.water), { w: 1.3 });
      iso.at([0.7, 0.14, 0.05], (s, [x, y], u) => {
        for (const [dx, dy, c] of [
          [-0.04, 0, MARIGOLD[0]],
          [0.03, -0.01, "#f7a8a0"],
          [0, 0.015, MARIGOLD[1]],
          [0.05, 0.012, MARIGOLD[2]],
        ] as const)
          flower(s, x + dx * u, y + dy * u, 0.01 * u, c, true);
      });
    },
    (iso) => {
      // the haldi swing (jhoola): two posts and a beam wound with marigolds, strands hanging down
      const A = 0.36;
      const B0 = 0.28;
      const B1 = 0.68;
      const TOP = 0.66;
      const post = (b: number) => {
        iso.box(A - 0.03, b - 0.03, 0, 0.06, 0.06, 0.03, WHITE, { color: HALDI.wood });
        iso.box(A - 0.015, b - 0.015, 0.03, 0.03, 0.03, TOP - 0.03, WHITE, { color: HALDI.wood });
        iso.at([A + 0.015, b + 0.015, TOP - 0.02], (s, [x, y], u) => {
          for (let k = 0; k < 13; k++) s.blob(x + Math.sin(k * 1.3) * 0.008 * u, y + k * 0.045 * u, 0.01 * u, 0.009 * u, tint(MARIGOLD[k % 3]), { w: 1, mask: true });
        });
      };
      post(B0);
      iso.box(A - 0.022, B0 - 0.04, TOP, 0.044, B1 - B0 + 0.08, 0.035, WHITE, { color: HALDI.wood });
      for (let b = B0 + 0.04; b < B1 - 0.02; b += 0.05)
        iso.at([A + 0.02, b, TOP], (s, [x, y], u) => {
          const L = (0.08 + ((Math.round(b * 100) * 7) % 4) * 0.015) * u;
          s.line(x, y, x, y + L, { w: 1, mask: true });
          for (let yy = 0.012 * u; yy < L; yy += 0.02 * u) s.blob(x, y + yy, 0.009 * u, 0.008 * u, tint(MARIGOLD[Math.round(yy * 300) % 3]), { w: 1, mask: true });
        });
      // ropes and a seat with a backrest and cushions
      const SZ = 0.17;
      const S0 = B0 + 0.07;
      const S1 = B1 - 0.07;
      for (const b of [S0, S1]) {
        iso.line([A - 0.04, b, TOP], [A - 0.04, b, SZ + 0.03], { w: 1.4 });
        iso.line([A + 0.04, b, TOP], [A + 0.04, b, SZ + 0.03], { w: 1.4 });
      }
      iso.box(A - 0.06, S0 - 0.01, SZ, 0.12, S1 - S0 + 0.02, 0.03, WHITE, { color: HALDI.wood });
      iso.box(A - 0.06, S0 - 0.01, SZ + 0.03, 0.02, S1 - S0 + 0.02, 0.1, WHITE, { color: HALDI.wood });
      iso.box(A - 0.04, S0 + 0.01, SZ + 0.03, 0.09, S1 - S0 - 0.02, 0.03, WHITE, { color: HALDI.accent });
      iso.box(A - 0.04, S0 + 0.03, SZ + 0.06, 0.03, 0.08, 0.07, WHITE, { color: HALDI.cushion });
      iso.box(A - 0.04, S1 - 0.11, SZ + 0.06, 0.03, 0.08, 0.07, WHITE, { color: MARIGOLD[1] });
      post(B1);
    },
    (iso) => {
      // a brass thali with bowls of haldi paste, rose water and petals
      iso.cyl(0.66, 0.4, 0, 0.11, 0.015, WHITE, { color: HALDI.brass });
      for (const [a, b, r, c] of [
        [0.63, 0.36, 0.035, HALDI.paste],
        [0.7, 0.38, 0.03, "#f7a8a0"],
        [0.66, 0.45, 0.03, HALDI.paste],
      ] as const) {
        iso.cyl(a, b, 0.015, r * 0.65, 0.03, WHITE, { r2: r, color: HALDI.brass });
        iso.disc(a, b, 0.045, r * 0.8, tint(c), { w: 1.2 });
      }
      // a kalash beside it
      iso.cyl(0.8, 0.5, 0, 0.035, 0.08, WHITE, { r2: 0.025, color: HALDI.brass });
      iso.at([0.8, 0.5, 0.08], (s, [x, y], u) => {
        for (const r of [-0.9, 0, 0.9]) almondLeaf(s, x + r * 0.014 * u, y - 0.014 * u, 0.016 * u, r, LEAF, true);
        s.blob(x, y - 0.024 * u, 0.015 * u, 0.015 * u, tint("#c9a27a"), { w: 1.3, mask: true });
      });
    },
  ]),
};

const WED = { wall: "#fde2bd", drape: "#e8447f", drape2: "#f5c453", floor: "#fbecd0", accent: "#f7b6cf", drapeLit: "#f27fa8", pillar: GOLD, seat: "#f5b942" };

/** Draped fabric hanging in swags across the top of a wall. */
function swags(s: Sketch, x1: number, x2: number, y: number, n: number, c: string) {
  const w = (x2 - x1) / n;
  for (let i = 0; i < n; i++) {
    const a = x1 + i * w;
    const swag: Pt[] = [[a, y], [a + w, y], ...s.ellipsePts(a + w / 2, y, w / 2, w * 0.35, 0, Math.PI, 12)];
    s.sticker(swag, 3, 0.16, tint(c));
    s.stroke(swag, { closed: true, w: 1.8 });
    s.stroke(s.ellipsePts(a + w / 2, y, w * 0.35, w * 0.2, 0.2, Math.PI - 0.2, 10), { w: 1, alpha: 0.6 });
  }
  for (let i = 0; i <= n; i++) s.blob(x1 + i * w, y, 0.014, 0.014, tint(MARIGOLD[0]), { w: 1.4 });
}

function drapePanel(s: Sketch, x: number, top: number, w: number, c: string) {
  const pts: Pt[] = [
    [x, top],
    [x + w, top],
    [x + w * 0.8, 0.5],
    [x + w * 1.05, 0.98],
    [x - w * 0.05, 0.98],
    [x + w * 0.2, 0.5],
  ];
  s.sticker(soft(pts, 2), 3, 0.18, tint(c));
  s.stroke(soft(pts, 2), { closed: true, w: 2 });
  s.line(x + w * 0.5, top + 0.02, x + w * 0.5, 0.95, { w: 1, alpha: 0.6 });
}

const MANDAP_H = 0.7;

/** A mandap pillar: stepped base, slim gold shaft, a capital, and a kalash pot at its foot. */
function mandapPillar(iso: Iso, a: number, b: number) {
  iso.box(a - 0.035, b - 0.035, 0, 0.07, 0.07, 0.03, WHITE, { color: "#efd6ae" });
  iso.box(a - 0.025, b - 0.025, 0.03, 0.05, 0.05, 0.03, WHITE, { color: WED.pillar });
  iso.box(a - 0.014, b - 0.014, 0.06, 0.028, 0.028, MANDAP_H - 0.1, WHITE, { color: WED.pillar });
  iso.box(a - 0.026, b - 0.026, MANDAP_H - 0.04, 0.052, 0.052, 0.04, WHITE, { color: "#efd6ae" });
  // marigold strand wound down the pillar
  iso.at([a + 0.014, b + 0.014, MANDAP_H - 0.06], (s, [x, y], u) => {
    for (let k = 0; k < 10; k++) s.blob(x + Math.sin(k * 1.3) * 0.008 * u, y + k * 0.05 * u, 0.009 * u, 0.008 * u, tint(MARIGOLD[k % 3]), { w: 1, mask: true });
  });
  // kalash: a round pot with mango leaves and a coconut
  const ka = a + 0.06;
  const kb = b + 0.06;
  iso.cyl(ka, kb, 0, 0.022, 0.05, WHITE, { r2: 0.016, color: GOLD });
  iso.at([ka, kb, 0.05], (s, [x, y], u) => {
    for (const r of [-0.9, 0, 0.9]) almondLeaf(s, x + r * 0.012 * u, y - 0.012 * u, 0.013 * u, r, LEAF, true);
    s.blob(x, y - 0.02 * u, 0.012 * u, 0.012 * u, tint("#c9a27a"), { w: 1.3, mask: true });
  });
}

/** One side of the mandap: a beam with a scalloped fabric swag and hanging marigold strands. */
function mandapSide(iso: Iso, p: [number, number], q: [number, number]) {
  const H = MANDAP_H;
  const n = 16;
  const edge: [number, number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const sag = Math.abs(Math.sin(t * Math.PI * 2)) * 0.07 + 0.015;
    edge.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, H - sag]);
  }
  iso.face([[p[0], p[1], H], ...edge, [q[0], q[1], H]], tint(WED.drape), { w: 1.8 });
  iso.line([p[0], p[1], H + 0.012], [q[0], q[1], H + 0.012], { w: 3.2 });
  for (const t of [0.25, 0.5, 0.75]) {
    const a = p[0] + (q[0] - p[0]) * t;
    const b = p[1] + (q[1] - p[1]) * t;
    iso.at([a, b, H - 0.02], (s, [x, y], u) => {
      s.line(x, y, x, y + 0.13 * u, { w: 1, mask: true });
      for (let k = 0; k < 5; k++) s.blob(x, y + (0.025 + k * 0.022) * u, 0.01 * u, 0.009 * u, tint(MARIGOLD[k % 3]), { w: 1, mask: true });
    });
  }
}

const wedding: Room = {
  name: "wedding",
  mood: ev("wedding").tagline,
  left(s) {
    wash(s, WED.wall);
    swags(s, 0.0, 1.0, 0.05, 5, WED.drape);
    drapePanel(s, 0.06, 0.06, 0.1, WED.drape2);
    drapePanel(s, 0.84, 0.06, 0.1, WED.drape2);
    surya(s, 0.5, 0.3, 0.1);
    laris(s, [0.24, 0.3, 0.36, 0.64, 0.7, 0.76], 0.12, 0.3);
    // a shelf of diyas, with an elephant guarding either side
    s.sticker(s.rectPts(0.28, 0.66, 0.46, 0.025), 3, 0.18, tint("#e2c49a"));
    s.box(0.28, 0.66, 0.46, 0.025, null, { w: 2 });
    for (const x of [0.33, 0.43, 0.53, 0.63]) diya(s, x, 0.66, 0.045);
    elephant(s, 0.15, 0.93, 0.26, 1);
    elephant(s, 0.85, 0.93, 0.26, -1);
    bandhani(s, 0, 0.93, 1, 0.07, RAJ.rani);
  },
  right(s) {
    wash(s, WED.wall);
    swags(s, 0.0, 1.0, 0.05, 5, WED.drape);
    archFrame(s, 0.28, 0.2, 0.44, 0.46, RAJ.maroon);
    inviteCard(s, ev("wedding"), 0.28, 0.2, 0.44, 0.46, WED.accent);
    drapePanel(s, 0.06, 0.06, 0.1, WED.drape2);
    drapePanel(s, 0.84, 0.06, 0.1, WED.drape2);
    peacock(s, 0.17, 0.93, 0.3, 1);
    peacock(s, 0.83, 0.93, 0.3, -1);
    lotus(s, 0.4, 0.88, 0.07, RAJ.rani);
    lotus(s, 0.6, 0.88, 0.07, RAJ.rani);
    bandhani(s, 0, 0.93, 1, 0.07, RAJ.rani);
  },
  floor(s) {
    if (look.color) s.washAll(tint(WED.floor), 1);
    tiles(s, 6, 0.3);
    // a rangoli under the mandap
    const [cx, cy] = F(0.47, 0.47);
    mandala(s, cx, cy, 0.2, [RAJ.rani, RAJ.saffron, RAJ.gold, RAJ.peacock]);
  },
  popups: isoLayers([
    (iso) => {
      // mandap, back half: three pillars on stepped bases with kalash pots, and the two back
      // sides hung with scalloped fabric and marigolds
      for (const [a, b] of [
        [0.22, 0.22],
        [0.74, 0.22],
        [0.22, 0.74],
      ])
        mandapPillar(iso, a, b);
      mandapSide(iso, [0.22, 0.22], [0.74, 0.22]);
      mandapSide(iso, [0.22, 0.22], [0.22, 0.74]);
    },
    (iso) => {
      // the sacred fire on its stepped kund, two seats, a brass plate of offerings
      iso.box(0.38, 0.38, 0, 0.18, 0.18, 0.035, WHITE, { color: "#e2c49a" });
      iso.box(0.405, 0.405, 0.035, 0.13, 0.13, 0.035, WHITE, { color: "#efd6ae" });
      iso.box(0.43, 0.43, 0.07, 0.08, 0.08, 0.03, WHITE, { color: "#e2c49a" });
      iso.at([0.47, 0.47, 0.1], (s, [x, y], u) => {
        if (look.color) s.glow(x, y - 0.1 * u, 0.24 * u, "#ffb347", 0.65);
        const outer = soft(
          [
            [x - 0.07 * u, y],
            [x - 0.055 * u, y - 0.1 * u],
            [x - 0.02 * u, y - 0.15 * u],
            [x - 0.005 * u, y - 0.23 * u],
            [x + 0.03 * u, y - 0.13 * u],
            [x + 0.05 * u, y - 0.17 * u],
            [x + 0.07 * u, y],
          ],
          2,
        );
        s.shape(outer, tint("#ffcf5a"), { mask: true, w: 1.6 });
        s.shape(
          soft(
            [
              [x - 0.035 * u, y],
              [x - 0.01 * u, y - 0.12 * u],
              [x + 0.035 * u, y],
            ],
            2,
          ),
          tint("#f6a99a"),
          { mask: true, w: 1.2 },
        );
      });
      cushion(iso, 0.6, 0.34, 0.12, WED.seat);
      cushion(iso, 0.34, 0.6, 0.12, WED.seat);
      iso.cyl(0.6, 0.6, 0, 0.05, 0.015, WHITE, { r2: 0.06, color: GOLD });
      iso.at([0.6, 0.6, 0.015], (s, [x, y], u) => {
        for (const [dx, dy, c] of [
          [-0.02, -0.005, MARIGOLD[0]],
          [0.018, -0.008, "#f6b7aa"],
          [0, -0.02, MARIGOLD[1]],
        ] as const)
          s.blob(x + dx * u, y + dy * u, 0.012 * u, 0.01 * u, tint(c), { w: 1.2, mask: true });
      });
    },
    (iso) => {
      // front half: the fourth pillar, the two front sides and a peaked canopy on top
      mandapPillar(iso, 0.74, 0.74);
      mandapSide(iso, [0.74, 0.22], [0.74, 0.74]);
      mandapSide(iso, [0.22, 0.74], [0.74, 0.74]);
      const H = MANDAP_H;
      const apex: [number, number, number] = [0.48, 0.48, H + 0.2];
      iso.face([[0.74, 0.22, H], [0.74, 0.74, H], apex], tint(WED.drapeLit), { w: 2.2 });
      iso.face([[0.22, 0.74, H], [0.74, 0.74, H], apex], tint(WED.drape), { w: 2.2 });
      for (const t of [0.33, 0.66]) {
        iso.line([0.74, 0.22 + 0.52 * t, H], apex, { w: 1, alpha: 0.55 });
        iso.line([0.22 + 0.52 * t, 0.74, H], apex, { w: 1, alpha: 0.55 });
      }
      iso.at(apex, (s, [x, y], u) => {
        s.blob(x, y - 0.02 * u, 0.02 * u, 0.025 * u, tint(GOLD), { w: 1.6, mask: true });
        s.line(x, y - 0.045 * u, x, y - 0.07 * u, { w: 1.6, mask: true });
      });
    },
  ]),
};

const REC = {
  wall: "#f8e3b8",
  floor: "#ecd5a6",
  accent: "#f3e0aa",
  cloth: "#fffaf0",
  cake: "#fbefd9",
  glass: "#dcebfa",
  sofa: "#f3dccd",
  blush: "#f7ccd6",
  champagne: "#f5e3b0",
  gift: ["#f7ccd6", "#cfe0f7", "#f5e3b0"],
  runner: "#f6d6d0",
};

function chandelier(s: Sketch, x: number, y: number, w: number) {
  s.line(x, 0, x, y, { w: 1.6 });
  if (look.color) s.glow(x, y + w * 0.3, w * 1.4, "#ffe39a", 0.5);
  const arms: Pt[] = [...s.ellipsePts(x, y + w * 0.2, w, w * 0.28, 0, Math.PI, 14)];
  s.stroke(arms, { w: 2 });
  s.stroke(s.ellipsePts(x, y + w * 0.05, w * 0.6, w * 0.18, 0, Math.PI, 12), { w: 1.6 });
  for (const t of [-1, -0.5, 0, 0.5, 1]) {
    const cx = x + t * w;
    const cy = y + w * 0.2 + Math.sqrt(Math.max(0, 1 - t * t)) * w * 0.28;
    s.rect(cx - 0.006, cy - 0.04, 0.012, 0.04, { w: 1.2 });
    s.blob(cx, cy - 0.052, 0.006, 0.01, tint("#ffd56b"), { w: 1 });
    for (let k = 0; k < 2; k++) s.blob(cx, cy + 0.015 + k * 0.018, 0.005, 0.008, tint(REC.glass), { w: 1 });
  }
}

/** A floral arch on the wall behind the couple's seat, with their initials on a little sign. */
function floralArch(s: Sketch, x0: number, x1: number, top: number) {
  const cx = (x0 + x1) / 2;
  const rx = (x1 - x0) / 2;
  const arch: Pt[] = [[x0, 0.98], ...s.ellipsePts(cx, top + rx * 0.9, rx, rx * 0.9, Math.PI, Math.PI * 2, 24), [x1, 0.98]];
  s.stroke(arch, { w: 2.4 });
  const ring = s.ellipsePts(cx, top + rx * 0.9, rx, rx * 0.9, Math.PI, Math.PI * 2, 22);
  const path: Pt[] = [
    ...Array.from({ length: 8 }, (_, i) => [x0, 0.98 - i * ((0.98 - top - rx * 0.9) / 8)] as Pt),
    ...ring,
    ...Array.from({ length: 8 }, (_, i) => [x1, top + rx * 0.9 + i * ((0.98 - top - rx * 0.9) / 8)] as Pt),
  ];
  path.forEach(([x, y], i) => {
    if (i % 3 === 1) almondLeaf(s, x + (i % 2 ? 0.015 : -0.015), y, 0.016, i % 2 ? 0.9 : -0.9, LEAF);
  });
  path.forEach(([x, y], i) => {
    if (i % 2 === 0) flower(s, x, y, 0.011, i % 4 === 0 ? REC.blush : "#fffaf0");
  });
  // the sign
  const sign = s.rectPts(cx - 0.08, top + rx * 0.55, 0.16, 0.08);
  s.sticker(sign, 3, 0.18, tint("#fffaf0"));
  s.stroke(sign, { closed: true, w: 1.8 });
  s.text(WEDDING.initials, cx, top + rx * 0.55 + 0.04, 0.05);
  s.line(cx - 0.05, top + rx * 0.55, cx - 0.03, top + rx * 0.4, { w: 1 });
  s.line(cx + 0.05, top + rx * 0.55, cx + 0.03, top + rx * 0.4, { w: 1 });
}

/** A bunch of balloons on strings. */
function balloons(s: Sketch, x: number, y: number) {
  const list: [number, number, string][] = [
    [-0.03, -0.05, REC.blush],
    [0.03, -0.07, "#fffaf0"],
    [0.0, -0.11, REC.champagne],
    [0.05, -0.02, REC.blush],
  ];
  for (const [dx, dy] of list) s.stroke([[x, y + 0.12], [x + dx * 0.6, y + 0.05], [x + dx, y + dy + 0.03]], { w: 1 });
  for (const [dx, dy, c] of list) {
    const b = s.ellipsePts(x + dx, y + dy, 0.026, 0.032);
    s.sticker(b, 2, 0.14, tint(c));
    s.stroke(b, { closed: true, w: 1.6 });
    s.line(x + dx - 0.01, y + dy - 0.015, x + dx - 0.005, y + dy - 0.022, { w: 1.4, alpha: 0.7 });
  }
}

const reception: Room = {
  name: "reception",
  mood: ev("reception").tagline,
  left(s) {
    wash(s, REC.wall);
    kangura(s, 0.03, 10, 0.05, RAJ.sand);
    for (const x of [0.04, 0.76]) jharokha(s, x, 0.26, 0.2, 0.5, { inner: RAJ.night, dome: false });
    floralArch(s, 0.33, 0.67, 0.34);
    chandelier(s, 0.5, 0.12, 0.12);
    kandil(s, 0.25, 0.1, 0.035);
    kandil(s, 0.75, 0.1, 0.035);
    bandhani(s, 0, 0.9, 1, 0.09, RAJ.indigo);
  },
  right(s) {
    wash(s, REC.wall);
    kangura(s, 0.03, 10, 0.05, RAJ.sand);
    fairyLights(s, 0.02, 0.98, 0.1, 0.05);
    archFrame(s, 0.28, 0.2, 0.44, 0.42, RAJ.indigo);
    inviteCard(s, ev("reception"), 0.28, 0.2, 0.44, 0.42, REC.accent);
    couplePhoto(s, 0.06, 0.3, 0.13, 0.16, -0.03);
    couplePhoto(s, 0.8, 0.26, 0.12, 0.14, 0.05);
    // a camel caravan crossing the wall
    camel(s, 0.2, 0.88, 0.17, 1);
    camel(s, 0.5, 0.88, 0.17, 1);
    camel(s, 0.8, 0.88, 0.17, 1);
    bandhani(s, 0, 0.9, 1, 0.09, RAJ.indigo);
  },
  floor(s) {
    if (look.color) s.washAll(tint(REC.floor), 1);
    tiles(s, 5, 0.4);
    for (let i = 0; i < 20; i++) {
      const x = s.r();
      const y = s.r();
      s.line(x, y, x + 0.05, y + 0.02, { w: 1, alpha: 0.25 });
    }
    // an aisle runner up to the couple's seat, edged with petals
    const run = [F(0.26, 0.42), F(1.0, 0.42), F(1.0, 0.58), F(0.26, 0.58)];
    s.sticker(run, 2, 0.1, tint(REC.runner));
    s.stroke(run, { closed: true, w: 1.6 });
    for (let a = 0.3; a < 1; a += 0.06)
      for (const b of [0.4, 0.6]) {
        const [px, py] = F(a, b);
        s.blob(px, py, 0.008, 0.006, tint(REC.blush), { w: 1 });
      }
    s.shadow(s.ellipsePts(...F(0.14, 0.14), 0.1, 0.1), 0.22, 14);
    s.shadow([F(0.04, 0.34), F(0.2, 0.34), F(0.2, 0.66), F(0.04, 0.66)], 0.22, 14);
    s.shadow(s.ellipsePts(...F(0.62, 0.74), 0.17, 0.14), 0.22, 16);
  },
  popups: isoLayers([
    (iso) => {
      // cake table in the corner with a three-tier cake and a cake topper
      iso.cyl(0.14, 0.14, 0, 0.1, 0.22, WHITE, { color: REC.cloth });
      iso.cyl(0.14, 0.14, 0.22, 0.07, 0.07, WHITE, { color: REC.cake });
      iso.cyl(0.14, 0.14, 0.29, 0.052, 0.06, WHITE, { color: REC.cake });
      iso.cyl(0.14, 0.14, 0.35, 0.036, 0.05, WHITE, { color: REC.cake });
      iso.at([0.14, 0.14, 0.4], (s, [x, y], u) => {
        s.blob(x - 0.01 * u, y - 0.012 * u, 0.012 * u, 0.012 * u, tint("#f6b7aa"), { w: 1.3, mask: true });
        s.blob(x + 0.012 * u, y - 0.008 * u, 0.01 * u, 0.01 * u, tint(REC.blush), { w: 1.3, mask: true });
        s.line(x - 0.008 * u, y - 0.02 * u, x - 0.008 * u, y - 0.06 * u, { w: 1.2, mask: true });
        s.line(x + 0.008 * u, y - 0.02 * u, x + 0.008 * u, y - 0.06 * u, { w: 1.2, mask: true });
        s.text("t&z", x, y - 0.07 * u, 0.026 * u);
        s.maskFill(s.rectPts(x - 0.022 * u, y - 0.085 * u, 0.044 * u, 0.03 * u));
      });
      // the couple's loveseat under the floral arch
      iso.box(0.04, 0.36, 0, 0.16, 0.3, 0.12, WHITE, { color: REC.sofa });
      iso.box(0.03, 0.34, 0.12, 0.05, 0.34, 0.2, WHITE, { color: REC.sofa });
      iso.box(0.04, 0.33, 0, 0.16, 0.04, 0.19, WHITE, { color: REC.sofa });
      iso.box(0.04, 0.65, 0, 0.16, 0.04, 0.19, WHITE, { color: REC.sofa });
      iso.box(0.08, 0.4, 0.12, 0.05, 0.1, 0.08, WHITE, { color: REC.blush });
      iso.box(0.08, 0.53, 0.12, 0.05, 0.1, 0.08, WHITE, { color: REC.champagne });
      // a champagne tower on a little round table by the right wall
      iso.cyl(0.42, 0.12, 0, 0.07, 0.2, WHITE, { r2: 0.07, color: REC.cloth });
      iso.at([0.42, 0.12, 0.2], (s, [x, y], u) => {
        const coupe = (cx: number, cy: number) => {
          const bowl: Pt[] = [[cx - 0.016 * u, cy - 0.022 * u], [cx + 0.016 * u, cy - 0.022 * u], [cx + 0.004 * u, cy - 0.008 * u], [cx - 0.004 * u, cy - 0.008 * u]];
          s.shape(bowl, tint(REC.champagne), { mask: true, w: 1.2 });
          s.line(cx, cy - 0.008 * u, cx, cy, { w: 1.1, mask: true });
          s.line(cx - 0.008 * u, cy, cx + 0.008 * u, cy, { w: 1.1, mask: true });
        };
        for (const [n, row] of [
          [4, 0],
          [3, 1],
          [2, 2],
          [1, 3],
        ])
          for (let i = 0; i < n; i++) coupe(x + (i - (n - 1) / 2) * 0.034 * u, y - row * 0.026 * u);
        for (let k = 0; k < 4; k++) s.circle(x + (k - 1.5) * 0.02 * u, y - 0.12 * u - (k % 2) * 0.01 * u, 0.003 * u, { w: 1, mask: true });
      });
      // gift table with wrapped presents
      iso.box(0.62, 0.04, 0, 0.3, 0.14, 0.2, WHITE, { color: REC.cloth });
      const gifts: [number, number, number, number, number][] = [
        [0.64, 0.06, 0.08, 0.08, 0.08],
        [0.74, 0.07, 0.07, 0.07, 0.11],
        [0.83, 0.06, 0.07, 0.08, 0.06],
      ];
      gifts.forEach(([a, b, da, db, h], i) => {
        iso.box(a, b, 0.2, da, db, h, WHITE, { color: REC.gift[i] });
        iso.line([a + da / 2, b, 0.2 + h], [a + da / 2, b + db, 0.2 + h], { w: 1.6 });
        iso.line([a, b + db / 2, 0.2 + h], [a + da, b + db / 2, 0.2 + h], { w: 1.6 });
        iso.line([a + da / 2, b + db, 0.2], [a + da / 2, b + db, 0.2 + h], { w: 1.6 });
        iso.at([a + da / 2, b + db / 2, 0.2 + h], (s, [x, y], u) => {
          s.stroke(s.ellipsePts(x - 0.012 * u, y - 0.008 * u, 0.012 * u, 0.008 * u), { closed: true, w: 1.3, mask: true });
          s.stroke(s.ellipsePts(x + 0.012 * u, y - 0.008 * u, 0.012 * u, 0.008 * u), { closed: true, w: 1.3, mask: true });
        });
      });
    },
    (iso) => {
      // round dinner table with gold chairs, plates, glasses and a tall centrepiece
      const TX = 0.62;
      const TY = 0.74;
      const chair = (a: number, b: number, ang: number) => {
        const ca = TX + Math.cos(ang) * 0.21;
        const cb = TY + Math.sin(ang) * 0.21;
        for (const [da, db] of [
          [-0.025, -0.025],
          [0.025, -0.025],
          [-0.025, 0.025],
          [0.025, 0.025],
        ])
          iso.line([ca + da, cb + db, 0], [ca + da, cb + db, 0.13], { w: 1.8 });
        iso.box(ca - 0.032, cb - 0.032, 0.13, 0.064, 0.064, 0.018, WHITE, { color: GOLD });
        // back on the side away from the table
        const ba = ca + Math.cos(ang) * 0.03;
        const bb = cb + Math.sin(ang) * 0.03;
        const pa = -Math.sin(ang) * 0.028;
        const pb = Math.cos(ang) * 0.028;
        iso.box(Math.min(ba - pa, ba + pa) - 0.006, Math.min(bb - pb, bb + pb) - 0.006, 0.148, Math.abs(2 * pa) + 0.012, Math.abs(2 * pb) + 0.012, 0.15, WHITE, { color: GOLD });
        return [a, b];
      };
      // chairs behind the table first
      chair(0, 0, Math.PI * 1.25);
      chair(0, 0, Math.PI * 0.75);
      chair(0, 0, Math.PI * 1.75);
      // the table
      iso.cyl(TX, TY, 0, 0.15, 0.25, WHITE, { r2: 0.14, color: REC.cloth });
      for (const a of [0.2, 1.8, 3.4, 5.0]) {
        const px = TX + Math.cos(a) * 0.095;
        const py = TY + Math.sin(a) * 0.095;
        iso.disc(px, py, 0.252, 0.028, WHITE, { w: 1.3 });
        iso.cyl(px + Math.cos(a + 0.6) * 0.04, py + Math.sin(a + 0.6) * 0.04, 0.25, 0.008, 0.035, WHITE, { r2: 0.012, color: REC.glass });
      }
      iso.cyl(TX, TY, 0.25, 0.014, 0.1, WHITE, { r2: 0.02, color: REC.glass });
      iso.at([TX, TY, 0.35], (s, [x, y], u) => {
        for (const [dx, dy] of [
          [-0.03, 0],
          [0.03, -0.005],
          [0, -0.03],
          [-0.015, -0.018],
          [0.018, -0.022],
        ])
          flower(s, x + dx * u, y + dy * u, 0.011 * u, REC.blush, true);
        almondLeaf(s, x - 0.05 * u, y + 0.01 * u, 0.018 * u, -1.2, LEAF, true);
        almondLeaf(s, x + 0.05 * u, y + 0.01 * u, 0.018 * u, 1.2, LEAF, true);
      });
      // the chair in front
      chair(0, 0, Math.PI * 0.25);
    },
  ]),
};

const SG = { wall: "#8fd6d2", floor: "#f8bfd4", accent: "#c4ece8", cloth: "#fff4d8", clay: "#d9794f" };

const sangeet: Room = {
  name: "sangeet",
  mood: ev("sangeet").tagline,
  left(s) {
    wash(s, SG.wall);
    teeth(s, 0, 1, 0.03, 14, 0.035, RAJ.rani);
    for (const [x, y, z] of [
      [0.14, 0.09, 0.04],
      [0.32, 0.12, 0.03],
      [0.68, 0.12, 0.03],
      [0.86, 0.09, 0.04],
    ])
      kandil(s, x, y, z);
    surya(s, 0.5, 0.38, 0.13);
    for (const x of [0.04, 0.76]) jharokha(s, x, 0.28, 0.2, 0.5, { inner: RAJ.indigo, dome: false });
    garland(s, 0.28, 0.72, 0.6, 0.05, 0.012);
    bandhani(s, 0, 0.9, 1, 0.09, RAJ.rani);
  },
  right(s) {
    wash(s, SG.wall);
    teeth(s, 0, 1, 0.03, 14, 0.035, RAJ.rani);
    for (const [x, y, z] of [
      [0.12, 0.09, 0.04],
      [0.88, 0.09, 0.04],
    ])
      kandil(s, x, y, z);
    archFrame(s, 0.3, 0.2, 0.4, 0.44, RAJ.rani);
    inviteCard(s, ev("sangeet"), 0.3, 0.2, 0.4, 0.44, SG.accent);
    peacock(s, 0.14, 0.9, 0.3, 1);
    peacock(s, 0.86, 0.9, 0.3, -1);
    lotus(s, 0.38, 0.87, 0.07, RAJ.rani);
    lotus(s, 0.62, 0.87, 0.07, RAJ.rani);
    bandhani(s, 0, 0.9, 1, 0.09, RAJ.rani);
    for (const [x, y] of [
      [0.22, 0.4],
      [0.78, 0.4],
      [0.2, 0.62],
      [0.8, 0.62],
    ])
      sparkle(s, x, y, 0.022);
  },
  floor(s) {
    if (look.color) s.washAll(tint(SG.floor), 1);
    tiles(s, 6, 0.3);
    const [cx, cy] = F(0.58, 0.58);
    mandala(s, cx, cy, 0.24, [RAJ.turmeric, RAJ.peacock, RAJ.rani, RAJ.indigo]);
    s.shadow([F(0.04, 0.04), F(0.56, 0.04), F(0.56, 0.4), F(0.04, 0.4)], 0.2, 14);
    scatter(s, 40, 0.25, 0.95, 0.25, 0.95);
  },
  popups: isoLayers([
    (iso) => {
      // a gaddi (floor seating) stage in the corner, with bolsters, a harmonium and two dholaks
      iso.box(0.04, 0.04, 0, 0.52, 0.36, 0.06, WHITE, { color: SG.cloth });
      iso.box(0.06, 0.05, 0.06, 0.04, 0.34, 0.07, WHITE, { color: RAJ.rani });
      iso.box(0.06, 0.05, 0.06, 0.48, 0.04, 0.07, WHITE, { color: RAJ.turmeric });
      iso.box(0.13, 0.08, 0.06, 0.12, 0.09, 0.05, WHITE, { color: RAJ.clay });
      iso.at([0.19, 0.17, 0.115], (s, [x, y], u) => {
        for (let k = -2; k <= 2; k++) s.line(x + k * 0.02 * u, y, x + k * 0.02 * u, y + 0.02 * u, { w: 1, mask: true });
      });
      for (const [a, b] of [
        [0.34, 0.16],
        [0.42, 0.3],
      ]) {
        iso.cyl(a, b, 0.06, 0.05, 0.1, WHITE, { color: RAJ.clay });
        iso.at([a, b, 0.11], (s, [x, y], u) => {
          for (let k = -2; k <= 2; k++) s.line(x + k * 0.02 * u, y - 0.05 * u, x + k * 0.025 * u, y + 0.05 * u, { w: 1, mask: true });
        });
        iso.disc(a, b, 0.16, 0.05, tint("#f3e3c0"), { w: 1.4 });
      }
    },
    (iso) => {
      // a caparisoned elephant, standing as a flat pop-up in front
      const A = 0.74;
      const B = 0.62;
      const at = (dx: number, z: number): [number, number, number] => [A + dx * 0.7071, B - dx * 0.7071, z];
      iso.p(at(-0.24, 0));
      iso.p(at(0.27, 0));
      iso.p(at(0, 0.45));
      iso.at([A, B, 0], (s, [x, y], u) => elephant(s, x, y, 0.4 * u, 1, true));
    },
  ]),
};

export const ROOMS: Room[] = [haldi, sangeet, wedding, reception];

// ---------------------------------------------------------------------------
// covers

export function drawFrontCover(s: Sketch) {
  if (look.color) s.washAll(tint("#fbc24a"), 1);
  // a rani-pink bandhani band, then the blessing
  bandhani(s, 0.06, 0.07, 0.88, 0.055, RAJ.rani);
  s.text(WEDDING.blessing, 0.5, 0.165, 0.036, { weight: 500 });
  // the couple's names inside a cusped arch with a little dome on top
  const arch = cuspArch(0.16, 0.84, 0.72, 0.4, 0.28, 7);
  s.sticker(arch, 5, 0.25, tint(RAJ.ivory));
  s.stroke(arch, { closed: true, w: 3 });
  const inner = cuspArch(0.2, 0.8, 0.69, 0.42, 0.31, 7);
  s.stroke(inner, { closed: true, w: 1.5, alpha: 0.8 });
  s.fill(inner, tint(RAJ.gold), { alpha: 0.28, jitter: 0 });
  chhatri(s, 0.5, 0.265, 0.12);
  surya(s, 0.5, 0.385, 0.04);
  s.text(WEDDING.couple[0], 0.5, 0.49, 0.1, { family: "Yatra One" });
  s.text("weds", 0.5, 0.565, 0.036, { weight: 500 });
  s.text(WEDDING.couple[1], 0.5, 0.64, 0.1, { family: "Yatra One" });
  // peacocks and lotuses flank the arch
  peacock(s, 0.16, 0.78, 0.2, 1);
  peacock(s, 0.84, 0.78, 0.2, -1);
  lotus(s, 0.5, 0.715, 0.05, RAJ.rani);
  paisley(s, 0.14, 0.2, 0.045, 0.5, RAJ.rani);
  paisley(s, 0.86, 0.2, 0.045, -0.5, RAJ.rani);
  s.text(WEDDING.greeting, 0.5, 0.815, 0.044, { family: "Yatra One" });
  const first = WEDDING.events[0].start;
  const last = WEDDING.events[WEDDING.events.length - 1].start;
  s.text(`${fmtDay(first).split(" ").slice(1).join(" ")} – ${fmtDay(last).split(" ").slice(1).join(" ")} · ${WEDDING.city}`, 0.5, 0.865, 0.033, { weight: 500 });
  const g = getGuest();
  if (g) s.text(`for ${g}`, 0.5, 0.91, 0.04);
}

export function drawBackCover(s: Sketch) {
  if (look.color) s.washAll(tint("#f07aa5"), 1);
  bandhani(s, 0.06, 0.07, 0.88, 0.055, RAJ.saffron);
  bandhani(s, 0.06, 0.875, 0.88, 0.055, RAJ.saffron);
  surya(s, 0.5, 0.36, 0.14);
  s.text("with love & blessings", 0.5, 0.6, 0.052, { weight: 500 });
  s.text(`see you in ${WEDDING.city}`, 0.5, 0.67, 0.044, { weight: 500 });
  s.text(WEDDING.initials, 0.5, 0.76, 0.06);
  peacock(s, 0.17, 0.85, 0.2, 1);
  peacock(s, 0.83, 0.85, 0.2, -1);
}
