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
export const STROKES: Stroke[] = [
  // -- the gestural core (1-6): what a few loaded brush strokes can carry --
  // A shrimp curls into a single C: head high on the right, one continuous
  // sweep down through the belly and back up into a hooked tail flick at the
  // left. That's one coherent curl, not a wave — a wave is what reads as a
  // scribble instead of a curled body.
  {
    id: "body-main",
    shape: {
      kind: "path",
      d: "M 480,100 C 410,125 360,180 290,205 C 220,230 155,205 122,148 C 100,112 108,85 145,78",
    },
    width: 9,
  },
  {
    id: "head-rostrum",
    shape: { kind: "path", d: "M 478,96 C 498,89 518,85 538,83" },
    width: 5,
  },
  {
    id: "antenna-1",
    shape: { kind: "path", d: "M 476,92 C 518,58 572,25 622,5" },
    width: 2.5,
  },
  {
    id: "antenna-2",
    shape: { kind: "path", d: "M 476,106 C 512,138 552,175 588,210" },
    width: 2.5,
  },
  {
    id: "eye",
    shape: { kind: "circle", cx: 473, cy: 90, r: 4.5 },
    width: 0,
    fill: "currentColor",
  },
  {
    id: "tail-fan-basic",
    shape: {
      kind: "path",
      d: "M 145,78 L 170,58 M 142,82 L 162,72 M 139,87 L 152,100",
    },
    width: 3.5,
  },
  // -- the sweet spot (7-10): a little more life, still gesture --
  {
    id: "body-segment-1",
    shape: { kind: "path", d: "M 385,145 Q 392,163 380,177" },
    width: 3,
  },
  {
    id: "body-segment-2",
    shape: { kind: "path", d: "M 300,195 Q 307,212 295,225" },
    width: 3,
  },
  {
    id: "body-segment-3",
    shape: { kind: "path", d: "M 215,213 Q 222,230 210,242" },
    width: 3,
  },
  {
    id: "leg-cluster-impression",
    shape: {
      kind: "path",
      d: "M 270,200 L 260,220 M 245,208 L 236,227 M 220,213 L 211,231 M 195,213 L 187,231 M 170,205 L 163,222",
    },
    width: 2.5,
  },
  // -- over-elaboration (11-16): every part accounted for, the life gone --
  {
    id: "antenna-detail-ticks",
    shape: {
      kind: "path",
      d: "M 520,60 L 528,50 M 548,42 L 556,32 M 578,22 L 586,13",
    },
    width: 1.5,
  },
  {
    id: "tail-fan-full",
    shape: {
      kind: "path",
      d: "M 146,76 L 178,50 M 144,79 L 170,60 M 142,82 L 160,70 M 140,85 L 150,92 M 138,89 L 142,108 M 136,93 L 136,115",
    },
    width: 2.5,
  },
  {
    id: "leg-cluster-full",
    shape: {
      kind: "path",
      d: "M 350,175 L 342,196 M 325,188 L 317,208 M 300,198 L 292,217 M 275,205 L 267,224 M 250,210 L 242,228 M 225,213 L 217,231 M 200,212 L 193,229 M 175,206 L 169,222 M 150,195 L 145,210",
    },
    width: 2,
  },
  {
    id: "body-outline",
    shape: {
      kind: "path",
      d: "M 480,100 C 410,125 360,180 290,205 C 220,230 155,205 122,148 C 100,112 108,85 145,78",
    },
    width: 1.5,
    offset: { dx: 6, dy: 7 },
  },
  {
    id: "shading-hatch",
    shape: {
      kind: "path",
      d: "M 250,190 L 260,200 M 270,183 L 280,193 M 290,175 L 300,185 M 310,165 L 320,175 M 330,155 L 340,165 M 350,145 L 360,155",
    },
    width: 1.2,
  },
  {
    id: "eye-detail",
    shape: { kind: "circle", cx: 474.5, cy: 88.5, r: 1.5 },
    width: 0,
    fill: "#f5efe1",
  },
];

export type Phase = "unlike" | "sweet-spot" | "too-like";

// Below this many strokes, nothing on the canvas commits to being a shrimp.
export const UNLIKE_MAX = 3;
// Through this many, it reads as a shrimp without over-explaining itself.
// Above it, every part has been individually accounted for.
export const SWEET_SPOT_MAX = 10;

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
