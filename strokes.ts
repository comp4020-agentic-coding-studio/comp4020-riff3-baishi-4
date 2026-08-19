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
// Riff: redrawn to the coiled, comma-shaped pose of a stock line-icon shrimp
// (head top-left, body spiralling clockwise into a tucked tail) rather than
// baishi's open S-curve — a second pose to check the phase boundaries against,
// not a copy of the icon file itself, which stays out of this repo.
export const STROKES: Stroke[] = [
  // -- the gestural core (1-6): what a few loaded brush strokes can carry --
  // The coil: head at top-left, one continuous sweep down and right through
  // the belly, curling back under itself into a tucked tail. A spiral, not
  // the open C of the original — that's the pose this icon commits to.
  {
    id: "body-main",
    shape: {
      kind: "path",
      d: "M 150,75 C 230,55 320,75 375,140 C 410,182 400,225 345,245 C 290,263 235,245 210,205 C 195,180 195,155 205,135",
    },
    width: 9,
  },
  {
    id: "head-rostrum",
    shape: { kind: "path", d: "M 148,72 C 138,64 128,58 118,54" },
    width: 5,
  },
  {
    id: "antenna-1",
    shape: {
      kind: "path",
      d: "M 145,70 C 110,40 60,35 25,55 C 5,66 10,85 35,80",
    },
    width: 2.5,
  },
  {
    id: "antenna-2",
    shape: { kind: "path", d: "M 152,66 C 145,45 148,22 165,5" },
    width: 2.5,
  },
  {
    id: "eye",
    shape: { kind: "circle", cx: 158, cy: 72, r: 4.5 },
    width: 0,
    fill: "currentColor",
  },
  {
    id: "tail-fan-basic",
    shape: {
      kind: "path",
      d: "M 205,135 L 175,120 M 208,140 L 185,150 M 212,148 L 195,168",
    },
    width: 3.5,
  },
  // -- the sweet spot (7-10): a little more life, still gesture --
  {
    id: "body-segment-1",
    shape: { kind: "path", d: "M 278,88 Q 288,102 278,114" },
    width: 3,
  },
  {
    id: "body-segment-2",
    shape: { kind: "path", d: "M 345,155 Q 358,164 352,180" },
    width: 3,
  },
  {
    id: "body-segment-3",
    shape: { kind: "path", d: "M 322,222 Q 332,232 322,244" },
    width: 3,
  },
  {
    id: "leg-cluster-impression",
    shape: {
      kind: "path",
      d: "M 260,195 L 248,214 M 280,208 L 270,228 M 300,218 L 292,238 M 240,182 L 226,199",
    },
    width: 2.5,
  },
  // -- over-elaboration (11-16): every part accounted for, the life gone --
  {
    id: "antenna-detail-ticks",
    shape: {
      kind: "path",
      d: "M 90,42 L 82,32 M 60,42 L 54,30 M 32,62 L 22,58",
    },
    width: 1.5,
  },
  {
    id: "tail-fan-full",
    shape: {
      kind: "path",
      d: "M 205,135 L 170,116 M 207,138 L 178,128 M 210,143 L 183,144 M 212,148 L 191,158 M 213,153 L 197,172 M 213,159 L 202,183",
    },
    width: 2.5,
  },
  {
    id: "leg-cluster-full",
    shape: {
      kind: "path",
      d: "M 226,175 L 213,192 M 240,182 L 226,199 M 254,190 L 242,208 M 268,199 L 258,218 M 282,209 L 273,229 M 296,220 L 288,239 M 308,231 L 302,249",
    },
    width: 2,
  },
  {
    id: "leg-cluster-extra",
    shape: {
      kind: "path",
      d: "M 218,165 L 206,180 M 232,172 L 220,188 M 320,240 L 314,257",
    },
    width: 1.8,
  },
  {
    id: "antenna-hairs",
    shape: {
      kind: "path",
      d: "M 40,58 L 47,65 M 60,50 L 65,58 M 90,45 L 96,52 M 118,44 L 122,52",
    },
    width: 1.2,
  },
  {
    id: "rostrum-serration",
    shape: {
      kind: "path",
      d: "M 130,60 L 136,55 M 138,64 L 144,60",
    },
    width: 1.2,
  },
  {
    id: "body-segment-4",
    shape: { kind: "path", d: "M 250,68 Q 258,80 250,90" },
    width: 2.2,
  },
  {
    id: "tail-fin-veins",
    shape: {
      kind: "path",
      d: "M 190,145 L 178,152 M 198,152 L 188,162 M 204,160 L 195,171",
    },
    width: 1,
  },
  {
    id: "belly-shading",
    shape: {
      kind: "path",
      d: "M 260,235 L 270,242 M 280,242 L 290,249 M 300,246 L 310,253",
    },
    width: 1.2,
  },
  {
    id: "body-outline",
    shape: {
      kind: "path",
      d: "M 150,75 C 230,55 320,75 375,140 C 410,182 400,225 345,245 C 290,263 235,245 210,205 C 195,180 195,155 205,135",
    },
    width: 1.5,
    offset: { dx: 6, dy: 7 },
  },
  {
    id: "shading-hatch",
    shape: {
      kind: "path",
      d: "M 300,110 L 312,118 M 320,125 L 332,133 M 340,143 L 352,150 M 350,165 L 362,171 M 345,190 L 356,197 M 330,212 L 340,220",
    },
    width: 1.2,
  },
  {
    id: "eye-detail",
    shape: { kind: "circle", cx: 159.5, cy: 70.5, r: 1.5 },
    width: 0,
    fill: "#f5efe1",
  },
];

export type Phase = "unlike" | "sweet-spot" | "too-like";

// Below this many strokes, nothing on the canvas commits to being a shrimp.
export const UNLIKE_MAX = 4;
// Through this many, it reads as a shrimp without over-explaining itself.
// Above it, every part has been individually accounted for.
export const SWEET_SPOT_MAX = 15;

export function phaseFor(count: number, total: number = STROKES.length): Phase {
  const clamped = Math.max(0, Math.min(count, total));
  if (clamped <= UNLIKE_MAX) return "unlike";
  if (clamped <= SWEET_SPOT_MAX) return "sweet-spot";
  return "too-like";
}

export function labelFor(phase: Phase): string {
  switch (phase) {
    case "unlike":
      return "不似 — too few marks. Nothing here has committed to being a shrimp yet.";
    case "sweet-spot":
      return "妙在似与不似之间 — the marvel, between likeness and unlikeness.";
    case "too-like":
      return "太似 — every leg accounted for, and the life has gone out of it.";
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
