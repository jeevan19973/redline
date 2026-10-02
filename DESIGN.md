---
name: Underline
description: Ink on paper over stepped ink-blue water, with one cyan thermocline marking where the business ends.
colors:
  paper: "#FAF9F7"
  paper-shade: "#F0EEE9"
  ink: "#14161A"
  ink-soft: "#464B53"
  rule-paper: "#D9D6CF"
  water-1: "#1C4766"
  water-2: "#13314A"
  water-3: "#0D2236"
  water-4: "#081626"
  water-5: "#050A14"
  snow: "#E9EEF3"
  snow-soft: "#A9BACA"
  rule-water: "rgba(169, 186, 202, 0.28)"
  plumb: "#7F9DB6"
  thermo: "#23D6E6"
  thermo-bright: "#4FE3EF"
  thermo-deep: "#10A9B8"
  dangerous: "#B3261E"
  dangerous-bg: "#FDECEA"
  caution: "#8A5A00"
  caution-bg: "#FDF3DF"
  clean: "#3F4A54"
  clean-bg: "#EDF0F2"
typography:
  display:
    fontFamily: "Sofia Sans Extra Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(3rem, 6.1vw, 5.5rem)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Sofia Sans Extra Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 4.2vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "0.02em"
  title:
    fontFamily: "Sofia Sans Extra Condensed, Arial Narrow, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.02em"
  wordmark:
    fontFamily: "Sofia Sans Extra Condensed, Arial Narrow, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.04em"
  title-card:
    fontFamily: "Sofia Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.3
  body-lead:
    fontFamily: "Sofia Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Sofia Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  body-quote:
    fontFamily: "Sofia Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Azeret Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
  cite:
    fontFamily: "Azeret Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.02em"
    fontFeature: "\"tnum\" 1"
  action:
    fontFamily: "Azeret Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  none: "0px"
  node: "50%"
spacing:
  gap: "24px"
  gutter: "clamp(20px, 4vw, 48px)"
  section: "104px"
  section-deep: "112px"
  section-mobile: "72px"
components:
  action:
    backgroundColor: "{colors.thermo}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    padding: "0 22px"
    height: "52px"
  action-hover:
    backgroundColor: "{colors.thermo-bright}"
    textColor: "{colors.ink}"
  action-small:
    backgroundColor: "{colors.thermo}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.paper-shade}"
    textColor: "{colors.ink}"
  sev-dangerous:
    backgroundColor: "{colors.dangerous-bg}"
    textColor: "{colors.dangerous}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "5px 7px 4px"
  sev-caution:
    backgroundColor: "{colors.caution-bg}"
    textColor: "{colors.caution}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "5px 7px 4px"
  slate:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 16px 16px"
  verdict-clean:
    backgroundColor: "{colors.clean-bg}"
    textColor: "{colors.clean}"
    rounded: "{rounded.none}"
    padding: "22px 24px 20px"
  thermocline-label:
    backgroundColor: "{colors.thermo}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "5px 9px 4px"
---

# Design System: Underline

## Overview

**Creative North Star: "Depth of Reach"**

Severity is depth. The page is a vertical section through water: paper at the surface where the reader stands, stepped ink-blue water below, and one cyan thermocline where the business ends. Clauses that cost the business hang above that line. Clauses that reach past it to the Signer personally sit below. It follows ADR 0006, which puts everything the Signer reads on paper: every sentence the product quotes is carried down into the water on a paper slate, so reading always happens on paper and the water is only ground, chrome and depth.

The register is a technical instrument, not a dashboard. Display type is condensed caps, cites and readouts are a monospace instrument face, prose is a plain grotesk. Surfaces are square-cornered paper cards with soft drop shadows; lines are hairlines; the only circles are nodes where a line is fixed (rail ticks, plumb anchors, route stops). Density is moderate: wide 12-column grids with large water bands between them, small dense type inside the slates.

Motion is slow, damped and vertical. Underlines draw in, slates sink along their plumb lines to their depth, marine snow drifts down. Everything stills under reduced motion and the content is complete without it.

**Key Characteristics:**
- Paper at the surface and at the close; five stepped water fills between, deepening as the content reaches further.
- One cyan accent, the thermocline, which is also the only action color.
- Red appears only on a Dangerous severity label.
- Every quoted sentence is ink on paper with an ink underline, never a fill.
- Square corners on every surface and control; circles only as nodes on lines.
- Severity is always a word in a bordered label; color only supports it.

## Colors

Warm paper and near-black ink at the surface, cold ink-blue water in five flat steps below, one electric cyan, and two muted severity hues kept off the brand.

### Primary
- **Thermocline Cyan** (thermo): the brand's one accent. The primary action fill, the thermocline band and its label chip, the chart's dividing line, the data route's rail, the "It reads" column rule, the close section's top border, the lit ring on a slate, focus rings inside water, and text selection. Ink text sits on it, never white.
- **Thermocline Bright** (thermo-bright): the primary action's hover fill only.
- **Deep Thermocline** (thermo-deep): the wordmark's underline bar and the text caret. The cyan pulled dark enough to hold on paper as a line.

### Neutral: paper and ink
- **Paper** (paper): page ground at the surface and the close, and the material of every reading card in the water (lease, slates, blank page, secondary button).
- **Paper Shade** (paper-shade): secondary button hover and the scrollbar track.
- **Ink** (ink): all text on paper, the action's border and text, cited-sentence underlines, focus rings on paper.
- **Soft Ink** (ink-soft): captions, clause numbers, fine print, sheet row labels, cite links on paper.
- **Paper Rule** (rule-paper): hairlines on paper, link underlines at rest, the blank page's ruled lines.

### Neutral: water
- **Shallow Water** (water-1): the shallowest band, used for the data-route section.
- **Reach Water** (water-2): the hero's shallow band above the thermocline, and the "what it reads" section.
- **Cold Water** (water-3): the Clean verdict section.
- **Deep Water** (water-4): the band below the thermocline and the flag-anatomy section.
- **Abyss** (water-5): the deepest section, where the line is explained.
- **Snow** (snow): primary text on water and the marine-snow particles.
- **Soft Snow** (snow-soft): secondary text on water, the depth rail, chart nodes, the "doesn't read" list.
- **Water Rule** (rule-water): hairlines between rows on water.
- **Plumb Gray-Blue** (plumb): plumb lines and their anchor rings joining a sentence to its slate.

### Severity
- **Dangerous Red** (dangerous on dangerous-bg): the Dangerous severity label. Nowhere else.
- **Caution Ochre** (caution on caution-bg): the Caution severity label.
- **Clean Slate Gray** (clean on clean-bg): the Clean verdict card. Calm, neutral, explicitly not a success color.

### Named Rules
**The Scarce Red Rule.** Red is the Dangerous label's color and nothing else's: not the wordmark, not an action, not a border, not a quotation. A reader who sees red anywhere else stops reading it as a warning (ADR 0006).

**The One Cyan Rule.** The thermocline cyan is the only non-red accent. It marks the line, the action, focus and what is lit. Do not introduce a second accent hue.

**The Stepped Water Rule.** Water is flat fills in discrete steps, deeper sections darker. The one blend is across the thermocline itself, where the shallow band gives way to the deep band. No decorative gradients elsewhere.

**The Calm Clean Rule.** A Clean verdict is gray on pale gray. Never green, never a checkmark (ADR 0006, ADR 0004).

## Typography

**Display Font:** Sofia Sans Extra Condensed (with Arial Narrow, sans-serif)
**Body Font:** Sofia Sans (with Helvetica Neue, Arial, sans-serif)
**Label/Mono Font:** Azeret Mono (with ui-monospace, SFMono-Regular, Menlo, monospace)

All three are self-hosted variable WOFF2 files under the SIL Open Font License (see landing/fonts/SOURCES.md). The page makes no third-party font requests.

**Character:** Tall condensed caps read like stencilled gauge markings; the monospace gives clause numbers and severity words the feel of an instrument readout; the grotesk stays out of the way so the quoted legal text is easy to read.

### Hierarchy
- **Display** (600, clamp 3rem to 5.5rem, line-height 0.92, uppercase): the hero headline and the closing headline (which runs slightly larger, up to 5.75rem). Balanced wrapping.
- **Headline** (600, clamp 2.5rem to 3.75rem, line-height 0.95, uppercase): section headings in the water.
- **Title** (600, 1.75rem, line-height 1, uppercase): headings inside a band, such as "Above the line" and the readout title.
- **Wordmark** (800, 1.75rem, 0.04em tracking, uppercase, 1.25rem in the footer): "Underline" with a 3px Deep Thermocline bar beneath it.
- **Card Title** (Sofia Sans 700, 0.9375rem, line-height 1.3): flag names on slates; the verdict title runs at 1.1875rem.
- **Body Lead** (400, 1.125rem, line-height 1.5, max 42ch): the hero subhead. The close text runs at 1.1875rem, max 50ch.
- **Body** (400, 1.0625rem, line-height 1.55; 1rem under 760px): section prose, max 46ch.
- **Quote** (400, 0.8125rem, line-height 1.55): quoted Source sentences on the hero slates and lease clauses. On the anatomy sheet the quote runs at 0.9375rem.
- **Label** (Azeret Mono 600, 0.6875rem, 0.08em tracking, uppercase): severity labels, the take-it-or-leave-it tag, sheet row labels, thermocline labels.
- **Cite** (Azeret Mono 400, 0.75rem, 0.02em tracking, tabular figures): clause cites such as "§ 14.2", readout numbers, captions.
- **Action** (Azeret Mono 600, 0.875rem, 0.08em tracking, uppercase): the primary action's label; 0.75rem on the small action and the copy button.

### Named Rules
**The Instrument Face Rule.** Monospace is for things the product measures or cites: clause numbers, severity words, rail and thermocline labels, the action. Prose and quoted sentences are never set in mono.

**The Caps Are Display Rule.** Uppercase belongs to the condensed display face and to short mono labels. Body text, flag names and quotations stay in sentence case.

## Layout

A centered 12-column grid (max width 1360px, 24px column gap, side gutter clamp 20px to 48px). Content commonly splits 5 and 7 columns: copy on the left five, a paper figure on the right seven. Section copy spans columns 1 to 5, figures 7 to 12, and a mirrored section swaps them. The depth rail sits in the left gutter of the hero's water, so that water's content is inset to at least 44px.

Vertical rhythm comes from the water bands: sections are padded 104px to 120px top and bottom (72px under 760px; the close is 112px then 80px). Inside cards the rhythm tightens to 8px to 22px.

The hero's lease page sits on the waterline: it is placed at the bottom of the paper zone and overlaps the water by 18px. At the close, the blank page rises 172px into the last water band. Paper crossing the waterline is a recurring move.

Breakpoints: at 1100px and below the grid collapses to single-column stacks, slates go full width, plumb lines are hidden and each slate gets a short hairline stub and anchor ring on its left instead. At 760px and below the slates stack one per row, the thermocline labels stack vertically, the readout drops its cite column, and the primary action goes full width.

## Elevation & Depth

Depth is literal: it is carried by how dark the water is, not by shadow. The water is flat. Paper objects that sit on or in the water carry one soft, low drop shadow with a negative spread, so they read as cards floating just above the ground; nothing else has a shadow. Surfaces on paper (top bar, footer, close text) are flat with hairline borders.

### Shadow Vocabulary
- **Slate** (`box-shadow: 0 16px 30px -14px rgba(0, 0, 0, 0.6)`): flag slates and the Clean verdict card, in the water.
- **Lit slate** (`box-shadow: 0 0 0 2px var(--thermo), 0 18px 34px -14px rgba(0, 0, 0, 0.7)`): a slate that is hovered, focused, linked or targeted.
- **Waterline page** (`box-shadow: 0 18px 32px -18px rgba(5, 10, 20, 0.55)`): the hero lease resting on the waterline.
- **Rising page** (`box-shadow: 0 22px 40px -22px rgba(5, 10, 20, 0.6)`): the closing blank page rising out of the water.

### Named Rules
**The Paper Floats Rule.** Only paper in or on the water gets a shadow, and it is always soft and below the card. No hard offset shadows, no shadows on controls.

**The Depth Is Shown, Not Sorted Rule.** Depth shows how far a clause reaches. Wherever flags are ranked, Dangerous comes first; depth is never used to push Dangerous further down a list or report.

## Shapes

Square corners everywhere: cards, buttons, labels, chips, bands (0px). Borders are 1px hairlines in Paper Rule, Water Rule or Ink; emphasis lines are 2px cyan (the thermocline, the route rail, the column rule, the close border) or the 3px wordmark bar. The only round shapes are nodes fixed to a line: rail ticks and the thermocline node, plumb anchor rings, chart bullets (cyan-filled below the line, hollow above), and route stops. Direction marks (the action arrow, the thermocline's up and down chevrons) are drawn strokes, not font glyphs.

## Components

### Buttons
Tactile, instrument-like, unmistakable.
- **Shape:** square (0px), 1px ink border.
- **Primary action:** Thermocline Cyan fill, ink text in the Action style, 52px tall, 22px side padding, a 16px stroked arrow at the end. One primary action per view; the small variant (40px, 14px padding) lives in the top bar and hides under 760px, where the hero action goes full width.
- **Hover / Focus:** fill brightens to Thermocline Bright and the button lifts 1px over 180ms; it returns on press. Focus is a 2px ink outline offset 3px on paper, cyan in water.
- **Secondary (copy button):** paper fill, ink border, 36px tall, mono caps at 0.75rem. Hover shades to Paper Shade; after copying it shows "Copied" on Clean Slate's pale gray for 1.8s.

### Links
- **Text link:** sans 600 at 0.9375rem, 1px underline offset 4px in Paper Rule, darkening to the text color on hover. Cite links on slates use the same pattern in mono.

### Severity labels
- **Style:** Azeret Mono caps in a 1px border of its own text color on a pale tint of that color: red on pale red for Dangerous, ochre on cream for Caution. The word always appears; color only supports it.
- **Take it or leave it:** the Non-negotiable tag is the same shape in ink outline with no fill, pushed to the end of the slate's header.

### Slates (flag cards)
The product's signature container: paper carried into the water.
- **Corner Style:** square.
- **Background:** Paper, ink text, whatever the water behind it.
- **Shadow Strategy:** Slate shadow at rest; Lit slate when linked.
- **Internal Padding:** 14px 16px 16px.
- **Anatomy:** a header row (severity label, flag name, mono cite link pushed right), the quoted sentence underlined in ink, a hairline, then the plain-English reading in 500 weight. The anatomy sheet variant is a definition list of rows (Severity, Clause, Sentence, Reading, Counter-offer) split by Paper Rule hairlines.

### Cited sentence
- **Style:** ink text with a 1.5px ink underline offset 4px, skip-ink off, never a background fill. Linked or targeted, the underline thickens to 3px. During the descent the underline sinks in from 12px below and fades to ink.

### Clean verdict
- **Style:** square card on Clean Slate's pale gray with gray text, ink title, Slate shadow. "Checked for" list in two columns marked by short gray dashes, never checkmarks. A hairline stamp states the scope at the bottom.

### Readout
- **Style:** a ranked list on water: mono rank number in cyan, severity label, flag name, mono cite, each row split by Water Rule hairlines. Hover or linked rows take a 10% cyan tint. Dangerous rows come first.

### Thermocline
- **Style:** a 2px cyan line across the full width over a faint 16px cyan glow, with a cyan label chip in mono caps ("Where your business ends") and soft-snow up and down labels either side. A cyan node marks where it crosses the depth rail. Repeated in miniature as the chart's dividing line.

### Depth rail and plumb lines
- **Depth rail:** a 1px soft-snow line with ticks every 24px in the left gutter, labeled vertically in mono caps ("The business" above, "You" below).
- **Plumb lines:** 1px gray-blue paths from the end of each cited sentence down to its slate, ending in a paper anchor ring. Lighting one turns it 2px cyan and dims the rest to 35%.

### Linked highlight
Hovering or focusing a slate, a readout row or a cited sentence lights the other two (220ms to 240ms).

### Navigation
- **Top bar:** paper, 68px tall, hairline bottom border, wordmark left, text link and small action right. The footer repeats it at 72px with the small wordmark.

## Do's and Don'ts

### Do:
- **Do** put every quoted sentence on paper in ink with a 1.5px ink underline, wherever it appears.
- **Do** carry severity in a word (Dangerous, Caution) inside a bordered mono label, with color only as support.
- **Do** keep water fills stepped and get darker as content reaches further; blend only across the thermocline.
- **Do** use Thermocline Cyan for the line, the one action, focus in water and lit state, with ink text on it.
- **Do** keep corners square on every surface and control; use circles only as nodes on a line.
- **Do** rank Dangerous before Caution anywhere flags are listed, and show depth beside the ranking.
- **Do** use the ease-out curve (cubic-bezier(0.16, 1, 0.3, 1)) for slow vertical settling, and still all motion under prefers-reduced-motion.
- **Do** keep marine snow off text: particles skip any area holding copy, labels or slates.

### Don't:
- **Don't** use red for the wordmark, navigation, actions, borders, quotations or any chrome.
- **Don't** show a Clean verdict in green or with a checkmark.
- **Don't** fill a quoted sentence with a severity color or any highlight background.
- **Don't** add a second accent hue beside the cyan.
- **Don't** set prose or quotations in the monospace face.
- **Don't** give controls or paper-on-paper surfaces a shadow, or use hard offset shadows anywhere.
- **Don't** use depth to move Dangerous flags lower in a ranked list.
