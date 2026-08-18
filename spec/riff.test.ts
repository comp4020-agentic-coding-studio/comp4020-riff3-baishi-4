import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import {
  bothMarked,
  deltaFor,
  describeDelta,
  hasSweetSpot,
  PAGE_MARKS,
  phaseFor,
  STROKES,
  SWEET_SPOT_MAX,
  UNLIKE_MAX,
} from "../strokes";

// This replaces the crit's own spec. The agent's brief was "the visitor does
// something that changes what they see", and the slider satisfied it — but
// the page also handed over its answer while claiming it hadn't. The riff's
// contract is stricter: the visitor commits to both boundaries first, and the
// page's numbers appear only afterwards, as a second opinion.

describe("phaseFor: the reading the page keeps to itself until the end", () => {
  it("calls a handful of strokes 'unlike'", () => {
    expect(phaseFor(UNLIKE_MAX, STROKES.length)).toBe("unlike");
  });

  it("calls the middle range the sweet spot", () => {
    expect(phaseFor(UNLIKE_MAX + 1, STROKES.length)).toBe("sweet-spot");
    expect(phaseFor(SWEET_SPOT_MAX, STROKES.length)).toBe("sweet-spot");
  });

  it("calls the fully-detailed drawing 'too like' again", () => {
    expect(phaseFor(STROKES.length, STROKES.length)).toBe("too-like");
  });

  it("clamps out-of-range counts instead of throwing", () => {
    expect(phaseFor(-5, STROKES.length)).toBe("unlike");
    expect(phaseFor(STROKES.length + 5, STROKES.length)).toBe("too-like");
  });

  it("states the page's boundaries as the edges of its own sweet spot", () => {
    expect(phaseFor(PAGE_MARKS.became)).toBe("sweet-spot");
    expect(phaseFor(PAGE_MARKS.became - 1)).toBe("unlike");
    expect(phaseFor(PAGE_MARKS.stiffened)).toBe("sweet-spot");
    expect(phaseFor(PAGE_MARKS.stiffened + 1)).toBe("too-like");
  });
});

describe("the visitor's marks are the thing being compared", () => {
  it("isn't complete until both boundaries are marked", () => {
    expect(bothMarked({ became: null, stiffened: null })).toBe(false);
    expect(bothMarked({ became: 5, stiffened: null })).toBe(false);
    expect(bothMarked({ became: 5, stiffened: 12 })).toBe(true);
  });

  it("measures a visitor against the page, signed so earlier reads negative", () => {
    expect(deltaFor("became", { became: PAGE_MARKS.became, stiffened: null })).toBe(0);
    expect(deltaFor("became", { became: PAGE_MARKS.became - 2, stiffened: null })).toBe(-2);
    expect(deltaFor("stiffened", { became: null, stiffened: PAGE_MARKS.stiffened + 3 })).toBe(3);
  });

  it("has no delta to report before the boundary is marked", () => {
    expect(deltaFor("became", { became: null, stiffened: 9 })).toBeNull();
  });

  it("says who was earlier in words, and agrees out loud when they match", () => {
    expect(describeDelta("became", 0)).toContain("same stroke");
    expect(describeDelta("became", -1)).toContain("1 stroke earlier");
    expect(describeDelta("stiffened", 4)).toContain("4 strokes later");
  });

  it("lets a visitor have no sweet spot at all, which the page's scheme can't", () => {
    expect(hasSweetSpot({ became: 4, stiffened: 10 })).toBe(true);
    expect(hasSweetSpot({ became: 9, stiffened: 4 })).toBe(false);
    expect(hasSweetSpot({ became: 6, stiffened: 6 })).toBe(false);
  });
});

describe("the built page makes the visitor go first", () => {
  const distPath = resolve("dist/index.html");
  const doc = new JSDOM(readFileSync(distPath, "utf8")).window.document;

  it("built the page", () => {
    expect(existsSync(distPath)).toBe(true);
  });

  it("ships a slider spanning every stroke, starting at zero", () => {
    const slider = doc.querySelector<HTMLInputElement>('[data-testid="stroke-slider"]');
    expect(slider).toBeTruthy();
    expect(slider?.getAttribute("min")).toBe("0");
    expect(slider?.getAttribute("max")).toBe(String(STROKES.length));
    expect(slider?.getAttribute("value")).toBe("0");
  });

  it("has somewhere for the strokes to be drawn", () => {
    expect(doc.querySelector("#shrimp-canvas")).toBeTruthy();
  });

  it("offers a button for each boundary the visitor is asked to mark", () => {
    expect(doc.querySelector('[data-testid="mark-became"]')).toBeTruthy();
    expect(doc.querySelector('[data-testid="mark-stiffened"]')).toBeTruthy();
  });

  it("announces what has been marked so far", () => {
    const readout = doc.querySelector('[data-testid="marks-readout"]');
    expect(readout).toBeTruthy();
    expect(readout?.closest("[aria-live]")).toBeTruthy();
  });

  it("ships the comparison hidden, so the page can't answer before it's asked", () => {
    const panel = doc.querySelector<HTMLElement>('[data-testid="verdict"]');
    expect(panel).toBeTruthy();
    expect(panel?.hasAttribute("hidden")).toBe(true);
    expect(panel?.closest("[aria-live]")).toBeTruthy();
  });

  it("keeps the page's own numbers out of the served markup", () => {
    const served = readFileSync(distPath, "utf8");
    for (const cell of ["page-became", "page-stiffened"]) {
      const el = doc.querySelector(`[data-testid="${cell}"]`);
      expect(el).toBeTruthy();
      expect(el?.textContent?.trim()).toBe("");
    }
    expect(served).not.toContain(`stroke ${PAGE_MARKS.became}`);
    expect(served).not.toContain(`stroke ${PAGE_MARKS.stiffened}`);
  });
});
