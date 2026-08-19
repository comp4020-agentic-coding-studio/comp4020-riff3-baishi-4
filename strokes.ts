// The data and logic behind the one interaction on this page: reveal an ink
// shrimp one brushstroke at a time and watch where recognition lives. Kept
// separate from main.ts (which only touches the DOM) so the interaction's
// actual contract — how many strokes, and which phase a count falls in — is a
// plain function spec/assignment-1.test.ts can call directly.

export type StrokeShape =
  | { kind: "path"; d: string }
  | { kind: "circle"; cx: number; cy: number; r: number };

export interface Stroke {
  id: string;
  shape: StrokeShape;
  width: number;
  fill?: string;
  // Offsets the whole stroke a few px, for the one stroke (body-outline)
  // that needs to read as a second, over-traced line rather than sit
  // exactly on top of the gesture it's duplicating.
  offset?: { dx: number; dy: number };
}

// Ordered from the gestural core a painter would lay down first to the
// over-specified detail that stiffens the same subject into a diagram.
//
// Riff: redrawn again, this time as a fish rather than a shrimp — pose taken
// from a plain line icon (forked tail left, dorsal ridge, pointed snout right,
// small eye), not a copy of the icon file itself, which stays out of this
// repo. Qi Baishi's rule was written about shrimp; this checks whether it
// still holds once the subject changes.
export const STROKES: Stroke[] = [
  // -- the gestural core (1-6): what a few loaded brush strokes can carry --
  // The outline in three passes rather than one unbroken line, so the shape
  // arrives the way a brush actually lays it down: tail and back first,
  // then the snout and mouth, then the belly closing the loop.
  {
    id: "body-outline-tail-back",
    shape: {
      kind: "path",
      d: "M 75,150 L 30,105 L 95,140 C 130,80 190,40 230,35 C 265,30 275,70 280,100",
    },
    width: 8,
  },
  {
    id: "body-outline-snout",
    shape: {
      kind: "path",
      d: "M 280,100 C 320,115 345,130 365,150 C 345,168 320,180 330,195",
    },
    width: 8,
  },
  {
    id: "body-outline-belly",
    shape: {
      kind: "path",
      d: "M 330,195 C 300,215 240,222 200,215 C 185,230 182,236 180,235 C 140,220 105,195 95,165 L 35,195 L 75,150",
    },
    width: 8,
  },
  {
    id: "mouth-line",
    shape: { kind: "path", d: "M 330,195 L 340,205 M 335,200 L 320,210" },
    width: 3,
  },
  {
    id: "eye",
    shape: { kind: "circle", cx: 325, cy: 130, r: 5 },
    width: 0,
    fill: "currentColor",
  },
  {
    id: "pectoral-fin-basic",
    shape: { kind: "path", d: "M 300,150 C 292,172 278,184 262,180" },
    width: 3,
  },
  // -- the sweet spot (7-17): a little more life, still gesture --
  {
    id: "gill-line",
    shape: { kind: "path", d: "M 300,110 Q 310,150 300,190" },
    width: 2,
  },
  {
    id: "lateral-line",
    shape: { kind: "path", d: "M 130,125 Q 200,133 270,128" },
    width: 2,
  },
  {
    id: "tail-fin-inner-line",
    shape: { kind: "path", d: "M 75,150 L 55,148" },
    width: 2,
  },
  {
    id: "second-dorsal-ridge",
    shape: { kind: "path", d: "M 255,70 L 264,52 L 278,72" },
    width: 2.5,
  },
  {
    id: "anal-fin",
    shape: { kind: "path", d: "M 230,205 L 222,225 L 245,208" },
    width: 2.5,
  },
  {
    id: "pelvic-fin",
    shape: { kind: "path", d: "M 180,235 L 172,250 L 195,232" },
    width: 2,
  },
  {
    id: "pectoral-fin-detail",
    shape: { kind: "path", d: "M 298,158 L 285,178" },
    width: 2,
  },
  {
    id: "body-segment-belly",
    shape: { kind: "path", d: "M 110,175 Q 190,200 290,178" },
    width: 1.8,
  },
  {
    id: "mouth-detail",
    shape: { kind: "path", d: "M 335,200 L 348,203" },
    width: 1.2,
  },
  {
    id: "gill-cover-line",
    shape: { kind: "path", d: "M 275,105 Q 282,150 275,185" },
    width: 1.2,
  },
  {
    id: "dorsal-fin-ray-ticks",
    shape: {
      kind: "path",
      d: "M 216,62 L 220,50 M 226,58 L 230,46 M 236,62 L 240,52",
    },
    width: 1.2,
  },
  // -- over-elaboration (18-24): every fin ray and scale accounted for --
  {
    id: "scale-hatch-row1",
    shape: {
      kind: "path",
      d: "M 150,95 L 160,102 M 175,92 L 185,99 M 200,90 L 210,97",
    },
    width: 1,
  },
  {
    id: "scale-hatch-row2",
    shape: {
      kind: "path",
      d: "M 140,140 L 152,144 M 165,138 L 177,142 M 190,137 L 202,141 M 215,138 L 227,142",
    },
    width: 1,
  },
  {
    id: "scale-hatch-row3",
    shape: {
      kind: "path",
      d: "M 150,175 L 160,182 M 175,178 L 185,185 M 200,180 L 210,187",
    },
    width: 1,
  },
  {
    id: "anal-fin-ray-ticks",
    shape: { kind: "path", d: "M 226,210 L 220,222 M 236,212 L 232,224" },
    width: 1,
  },
  {
    id: "tail-fin-ray-ticks",
    shape: { kind: "path", d: "M 45,125 L 33,112 M 42,168 L 32,180" },
    width: 1,
  },
  {
    id: "body-outline",
    shape: {
      kind: "path",
      d: "M 75,150 L 30,105 L 95,140 C 130,80 190,40 230,35 C 265,30 275,70 280,100 C 320,115 345,130 365,150 C 345,168 320,180 330,195 C 300,215 240,222 200,215 C 185,230 182,236 180,235 C 140,220 105,195 95,165 L 35,195 Z",
    },
    width: 1.5,
    offset: { dx: 5, dy: 6 },
  },
  {
    id: "eye-detail",
    shape: { kind: "circle", cx: 326.5, cy: 128, r: 1.5 },
    width: 0,
    fill: "#f5efe1",
  },
];

export type Phase = "unlike" | "sweet-spot" | "too-like";

// Below this many strokes, nothing on the canvas commits to being a shrimp.
export const UNLIKE_MAX = 6;
// Through this many, it reads as a shrimp without over-explaining itself.
// Above it, every part has been individually accounted for.
export const SWEET_SPOT_MAX = 17;

export function phaseFor(count: number, total: number = STROKES.length): Phase {
  const clamped = Math.max(0, Math.min(count, total));
  if (clamped <= UNLIKE_MAX) return "unlike";
  if (clamped <= SWEET_SPOT_MAX) return "sweet-spot";
  return "too-like";
}

export function labelFor(phase: Phase): string {
  switch (phase) {
    case "unlike":
      return "不似 — too few marks. Nothing here has committed to being a fish yet.";
    case "sweet-spot":
      return "妙在似与不似之间 — the marvel, between likeness and unlikeness.";
    case "too-like":
      return "太似 — every fin ray and scale accounted for, and the life has gone out of it.";
  }
}

// --- the riff: the visitor's own two boundaries -------------------------
// The page above asserts thresholds (UNLIKE_MAX, SWEET_SPOT_MAX) and then
// claims nobody told you where they were. Both can't be true. So the visitor
// marks their own two boundaries first, and only then does the page show
// what it thinks — as a second opinion, not an answer key.

export type Boundary = "became" | "stiffened";

export interface Marks {
  // Stroke count at which the visitor said "that's a shrimp now".
  became: number | null;
  // Stroke count at which they said "the life has gone out of it".
  stiffened: number | null;
}

export const NO_MARKS: Marks = { became: null, stiffened: null };

// What this page would have claimed if it had gone first: the first stroke
// that isn't "unlike", and the last stroke that isn't yet "too like".
export const PAGE_MARKS: Record<Boundary, number> = {
  became: UNLIKE_MAX + 1,
  stiffened: SWEET_SPOT_MAX,
};

export function bothMarked(marks: Marks): boolean {
  return marks.became !== null && marks.stiffened !== null;
}

// Visitor minus page: negative means they saw it earlier than the page does.
export function deltaFor(boundary: Boundary, marks: Marks): number | null {
  const mark = marks[boundary];
  return mark === null ? null : mark - PAGE_MARKS[boundary];
}

export function describeDelta(boundary: Boundary, delta: number): string {
  const noun = boundary === "became" ? "recognition" : "the stiffening";
  if (delta === 0) return `You and the page put ${noun} at the same stroke.`;
  const strokes = Math.abs(delta) === 1 ? "1 stroke" : `${Math.abs(delta)} strokes`;
  return delta < 0
    ? `You saw ${noun} ${strokes} earlier than the page claims.`
    : `You saw ${noun} ${strokes} later than the page claims.`;
}

// The one case the page's own scheme can't represent: a visitor for whom the
// sweet spot never opens, because it stiffened before it ever read as a shrimp.
export function hasSweetSpot(marks: Marks): boolean {
  return bothMarked(marks) && (marks.stiffened as number) > (marks.became as number);
}
