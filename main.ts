import type { Boundary, Marks } from "./strokes";
import {
  bothMarked,
  describeDelta,
  deltaFor,
  hasSweetSpot,
  labelFor,
  NO_MARKS,
  PAGE_MARKS,
  phaseFor,
  STROKES,
} from "./strokes";

const SVG_NS = "http://www.w3.org/2000/svg";

const canvas = document.querySelector<SVGSVGElement>("#shrimp-canvas");
const slider = document.querySelector<HTMLInputElement>("#stroke-slider");
const countLabel = document.querySelector<HTMLElement>("#stroke-count");
const marksReadout = document.querySelector<HTMLElement>("#marks-readout");
const verdict = document.querySelector<HTMLElement>("#verdict");
const becameButton = document.querySelector<HTMLButtonElement>("#mark-became");
const stiffenedButton = document.querySelector<HTMLButtonElement>("#mark-stiffened");
const resetButton = document.querySelector<HTMLButtonElement>("#mark-reset");
const clearDrawingButton = document.querySelector<HTMLButtonElement>("#clear-drawing");

const cell = (name: string) =>
  document.querySelector<HTMLElement>(`[data-testid="${name}"]`);

if (
  canvas && slider && countLabel && marksReadout && verdict &&
  becameButton && stiffenedButton && resetButton
) {
  const elements = STROKES.map((stroke) => {
    const el = document.createElementNS(
      SVG_NS,
      stroke.shape.kind === "circle" ? "circle" : "path",
    );
    if (stroke.shape.kind === "circle") {
      el.setAttribute("cx", String(stroke.shape.cx));
      el.setAttribute("cy", String(stroke.shape.cy));
      el.setAttribute("r", String(stroke.shape.r));
      el.setAttribute("fill", stroke.fill ?? "currentColor");
    } else {
      el.setAttribute("d", stroke.shape.d);
      el.setAttribute("fill", "none");
      el.setAttribute("stroke", "currentColor");
      el.setAttribute("stroke-width", String(stroke.width));
      el.setAttribute("stroke-linecap", "round");
      el.setAttribute("stroke-linejoin", "round");
    }
    el.dataset.strokeId = stroke.id;
    if (stroke.offset) {
      el.setAttribute("transform", `translate(${stroke.offset.dx}, ${stroke.offset.dy})`);
    }
    canvas.appendChild(el);
    return el;
  });

  slider.max = String(STROKES.length);

  let marks: Marks = { ...NO_MARKS };

  const describeMarks = (): string => {
    const parts: string[] = [];
    if (marks.became !== null) parts.push(`became a fish at ${marks.became}`);
    if (marks.stiffened !== null) parts.push(`went stiff at ${marks.stiffened}`);
    return parts.length === 0 ? "Nothing marked yet." : `You said: ${parts.join("; ")}.`;
  };

  // The page's own phase reading is withheld until the visitor has committed
  // to both boundaries — that's the whole point of the riff, so it lives here
  // rather than being announced live as the slider moves.
  const showVerdict = () => {
    (["became", "stiffened"] as Boundary[]).forEach((boundary) => {
      const you = cell(`you-${boundary}`);
      const page = cell(`page-${boundary}`);
      const line = cell(`verdict-${boundary}`);
      const delta = deltaFor(boundary, marks);
      if (you) you.textContent = `stroke ${marks[boundary]}`;
      if (page) page.textContent = `stroke ${PAGE_MARKS[boundary]}`;
      if (line && delta !== null) line.textContent = describeDelta(boundary, delta);
    });
    const close = cell("verdict-close");
    if (close) {
      close.textContent = hasSweetSpot(marks)
        ? `Between your two marks there are ${
          (marks.stiffened as number) - (marks.became as number)
        } strokes where you'd have called it alive. ${
          labelFor(phaseFor(marks.became as number))
        }`
        : "You never gave it a sweet spot: by your reading it stiffened before it ever read as a fish. This page has no way to be right about that, and it was built assuming nobody would say it.";
    }
    verdict.hidden = false;
    resetButton.hidden = false;
  };

  const render = (count: number) => {
    elements.forEach((el, index) => {
      el.style.opacity = index < count ? "1" : "0";
    });
    countLabel.textContent = `${count} / ${STROKES.length}`;
    canvas.dataset.visibleCount = String(count);
  };

  const mark = (boundary: Boundary) => {
    marks = { ...marks, [boundary]: Number(slider.value) };
    marksReadout.textContent = describeMarks();
    if (bothMarked(marks)) showVerdict();
  };

  becameButton.addEventListener("click", () => mark("became"));
  stiffenedButton.addEventListener("click", () => mark("stiffened"));
  resetButton.addEventListener("click", () => {
    marks = { ...NO_MARKS };
    marksReadout.textContent = describeMarks();
    verdict.hidden = true;
    resetButton.hidden = true;
    slider.value = "0";
    render(0);
    slider.focus();
  });

  slider.addEventListener("input", () => {
    render(Number(slider.value));
  });

  render(Number(slider.value));
  marksReadout.textContent = describeMarks();

  // Freehand painting, layered over the slider-driven strokes. Points are
  // mapped from screen space into the SVG's own viewBox coordinates via its
  // CTM, so drawing stays under the pointer regardless of how the canvas is
  // scaled on the page.
  const toPoint = (event: PointerEvent): { x: number; y: number } | null => {
    const ctm = canvas.getScreenCTM();
    if (!ctm) return null;
    const point = canvas.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  };

  let userStrokeCount = 0;
  let activePath: SVGPathElement | null = null;

  const updateClearButton = () => {
    if (clearDrawingButton) clearDrawingButton.hidden = userStrokeCount === 0;
  };

  canvas.addEventListener("pointerdown", (event) => {
    const p = toPoint(event);
    if (!p) return;
    canvas.setPointerCapture(event.pointerId);
    activePath = document.createElementNS(SVG_NS, "path");
    activePath.setAttribute("d", `M ${p.x},${p.y}`);
    activePath.setAttribute("fill", "none");
    activePath.setAttribute("stroke", "currentColor");
    activePath.setAttribute("stroke-width", "3");
    activePath.setAttribute("stroke-linecap", "round");
    activePath.setAttribute("stroke-linejoin", "round");
    activePath.classList.add("user-ink");
    canvas.appendChild(activePath);
    userStrokeCount += 1;
    updateClearButton();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!activePath) return;
    const p = toPoint(event);
    if (!p) return;
    activePath.setAttribute("d", `${activePath.getAttribute("d")} L ${p.x},${p.y}`);
  });

  const endStroke = () => {
    activePath = null;
  };
  canvas.addEventListener("pointerup", endStroke);
  canvas.addEventListener("pointercancel", endStroke);
  canvas.addEventListener("pointerleave", endStroke);

  clearDrawingButton?.addEventListener("click", () => {
    canvas.querySelectorAll(".user-ink").forEach((path) => path.remove());
    userStrokeCount = 0;
    updateClearButton();
  });
}
