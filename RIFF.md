# Riff — C3, baishi, pod 4

Starting point: baishi's stroke-count shrimp at `riff-start`.

**The seam.** The prototype's own prose said "Nobody told you which stroke
count was which as you dragged" — but it did tell you, twice: a live phase
label announced the page's verdict on every drag, and the essay named strokes
four and five outright. The judgement it claimed to be provoking had already
been made for you.

**What pod 4 did.** The page now goes second. You drag, and you mark the two
boundaries yourself — "It's a shrimp now" and "It's gone stiff". Only once
both are marked does the page show its own hard-coded numbers, side by side
with yours, and say who was earlier. The essay's answer-giving lines moved
behind that reveal.

The comparison is served empty and hidden; a spec test asserts the page's
numbers aren't in the shipped markup at all, so the answer can't leak before
it's earned. One case the original scheme couldn't represent now has words:
a visitor whose drawing stiffened before it ever read as a shrimp, who never
had a sweet spot for the page to be right about.

`spec/assignment-1.test.ts` became `spec/riff.test.ts` — the crit's contract
replaced by this one. `spec/invariants.test.ts` is untouched and green.
