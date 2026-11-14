# ILRAS-UX: Anti-Slop Design Governance v1

**Status:** Adopted project governance proposal, version 1.0  
**Applies to:** UI, UX, visualization, responsive layout, accessibility, user-facing copy, and frontend code comments.  
**Does not apply as a substitute for:** ILRI methodology approval, data governance, backend security review, or release approval.

## 1. Source and adaptation

This project adapts the Anti-Slop framework by Miqdad Badjuber:

- Repository: https://github.com/miqdadbadjuber/anti-slop
- Upstream reference commit reviewed: `35b54dc660aa7d11428ee62c5788ad36bc18ac3c`
- Upstream release identified in its README: `v3.2.30`
- License: MIT, see upstream `LICENSE`.

The upstream describes Anti-Slop as a **filter, not a style guide**. It does not prescribe ILRAS colors, fonts, or layouts. `DESIGN.md` supplies ILRAS direction; this document adapts the filter and its delivery gate to ILRAS.

This is an adaptation, not a claim that the upstream project has reviewed or endorsed ILRAS. Consult the upstream repository for its full 40 rules and specialist skills. Do not silently assume that an upstream update has been incorporated here.

## 2. Governing model

A UI delivery must satisfy all four layers:

1. **Hard Gate:** non-negotiable honesty, functionality, accessibility, responsive behavior, and verification.
2. **Purpose-Gate:** visual techniques are allowed only when their purpose is stated.
3. **Liveliness:** the result has a deliberate focal point, hierarchy, whitespace rhythm, accent, and product identity.
4. **Craftsmanship:** intentionality, functional completeness, content-driven composition, resilience, and evidence over claims.

Removing generic patterns is not enough. The result must remain specific to ILRAS and useful for its decision-support purpose.

## 3. Craftsmanship standard

- **C-1 Intentionality:** every meaningful visual and copy decision has an explainable reason.
- **C-2 Functional completeness:** every interactive element performs a real action or is not presented as an active control.
- **C-3 Content-driven composition:** every section answers a real user or analytical need.
- **C-4 Resilience:** the interface works across loading, empty, error, normal, keyboard, and supported viewport states.
- **C-5 Evidence over claims:** facts, statistics, confidence, performance, security, and compliance claims require evidence.

## 4. Hard gates for ILRAS

A single failure blocks UI delivery.

### Honesty and content

- No invented statistics, testimonials, user counts, performance claims, security claims, compliance claims, or fabricated source attribution.
- No fabricated district history, forecast, indicator value, benchmark, cost, investment impact, or GIS precision.
- Clearly label verified, provisional, illustrative, and hypothetical information.
- Never blend scenario simulation output into observed historical trend.
- Use a real source or an explicit placeholder. Do not style placeholder data so that it appears verified.
- User-facing interface and reports remain in Bahasa Indonesia.

### Functionality and navigation

- Every button, link, tab, dropdown, filter, form, and map control has a real, testable behavior.
- No navigation link points to a page or section that does not exist.
- Remove dead controls. If a capability is intentionally unavailable, label it visibly and do not imply it is operational.
- Every data view includes loading, empty, and error states.
- Forms and validation provide visible, understandable feedback.

### Accessibility and human use

- Normal text contrast is at least WCAG AA 4.5:1; large text at least 3:1.
- Non-text controls and meaningful visual boundaries meet applicable non-text contrast requirements.
- All interactive controls are keyboard reachable and operable.
- Focus indicators remain visible. Never remove outlines without an adequate replacement.
- Use native semantic controls where possible, accessible names, visible form labels, and meaningful image alternatives.
- Do not rely on color alone to communicate readiness, risk, error, or status.
- Respect `prefers-reduced-motion`; do not use motion that blocks or obscures task completion.
- Test text resizing and zoom without clipping.

### Responsive behavior

- Mobile is a designed layout state, not desktop squeezed smaller.
- Verify phone, intermediate/tablet, and desktop widths.
- No horizontal page overflow, clipped controls, overlapping cards, or hidden content.
- Interactive targets should aim for at least 44 by 44 CSS pixels, with adequate spacing.
- Hover-only interactions must have a touch and keyboard equivalent.
- Sticky navigation must not cover content or controls.

### Technical verification

- Run the app or build the deliverable before calling it complete.
- Run `npm ci`, `npm run lint`, and `npm run build` for frontend changes.
- Inspect browser console and network failures when browser verification is available.
- Click or keyboard-test each changed interactive element and record the observed behavior.
- Do not use external scripts that rewrite source or CSS by string replacement.
- Do not claim browser, device, accessibility, or performance verification that was not actually performed.

## 5. Purpose-Gate: techniques are tools, not defaults

The following are not automatically forbidden. Each use needs a short written purpose tied to hierarchy, identity, readability, or task completion:

- Gradients, glows, blur, glassmorphism, shadows, and decorative backgrounds.
- Icon libraries, illustrations, badges, pills, arrows, and status markers.
- Typography choices, monospace emphasis, uppercase labels, and display type.
- Card grids, bento layouts, repeated panels, and animation.
- Dark themes and accent-color emphasis.

For ILRAS specifically:

- Preserve the established design tokens unless a reviewed design decision changes them.
- Use glassmorphism only where it serves application chrome, not as a default treatment for analytical data.
- Do not turn every metric into a card. Choose a chart, map, table, timeline, or text explanation based on the question it answers.
- Avoid decorative map layers, grid patterns, and status colors that can be mistaken for data.

Record non-obvious decisions in the PR description or UI task report.

## 6. Liveliness requirements

For every materially new or redesigned screen, explicitly set:

- **ENERGY:** 1 Calm, 2 Balanced, or 3 Bold.
- **RHYTHM:** 1 Uniform, 2 Balanced, or 3 Asymmetric.
- **MOTION:** 1 Minimal, 2 Transitions, or 3 Choreographed.

Use the default from `DESIGN.md` unless the page purpose justifies another setting.

Every screen must have:

- One clear primary focal point.
- Deliberate information hierarchy.
- Whitespace used to structure content, not merely left over.
- A deliberate accent used sparingly.
- At least one product-specific identity motif, where appropriate.

### ILRAS default Design Read

> Reading this as: an operational industrial logistics readiness dashboard for government planning analysts, in an institutional analytical geographic language, dial ENERGY 1 / RHYTHM 2 / MOTION 1.

The focal point should follow the page's main decision question: overall readiness on the dashboard, the seven-dimension explanation on district detail, spatial evidence on GIS, trade-offs in comparison, and scenario deltas in simulation.

## 7. Delivery Gate

Complete the relevant checklist before merging or delivering UI work. Report each item as PASS, FAIL, or NOT VERIFIED. A FAIL blocks delivery. NOT VERIFIED must never be presented as PASS.

| Gate | Required evidence |
|---|---|
| Direction | Design Read and dials stated; `DESIGN.md` reviewed |
| Hard content | No unsupported metric, claim, source, history, forecast, or precision |
| Function | Changed controls tested; destinations and feedback verified |
| States | Loading, empty, error, and normal states reviewed for affected data views |
| Accessibility | Contrast, keyboard, focus, semantics, labels, and non-color status checked |
| Responsive | Phone, intermediate, and desktop reflow checked; no overflow or clipping |
| Purpose | Non-obvious visual techniques have written rationale |
| Liveliness | Focal point, hierarchy, whitespace, accent, and identity motif reviewed |
| Craftsmanship | C-1 through C-5 satisfied |
| Build | `npm ci`, `npm run lint`, `npm run build` pass |
| Interaction | Click-through or keyboard verification recorded for each changed interaction |
| Evidence | All PASS statements have concrete evidence; limitations are explicit |

### Required PR delivery note

Every UI PR must include:

1. Design Read and dial values.
2. Main user question and focal point.
3. Visual techniques used and their purpose.
4. Changed interactions and test results.
5. Responsive and accessibility verification.
6. Build/lint results.
7. PASS / FAIL / NOT VERIFIED delivery gate.

## 8. Audit mode

When the user asks to audit an existing UI without authorizing edits:

1. Produce a numbered findings list.
2. Each finding names the affected screen/component, violated gate, evidence, impact, and suggested correction.
3. Prioritize Hard Gate findings as High, Purpose-Gate as Medium, and Quality/Liveliness findings as Low unless user impact warrants escalation.
4. Do not modify code until the user approves specific findings.
5. After approved fixes, rerun the delivery gate and report evidence.

## 9. Scope and non-goals

This governance does not authorize:

- A visual redesign of the existing ILRAS UI.
- Changes to ILRI weights, scoring, normalization, indicator aggregation, or scenario assumptions.
- Changes to live deployment, database, authentication, or data sources.
- Addition of new product features or fabricated sample data.

Such changes require their own product, methodology, engineering, or release decision.

## 10. Maintenance

Review this adaptation when upstream Anti-Slop materially changes, especially rule numbering, Hard Gate requirements, accessibility guidance, or Delivery Gate. Record the upstream commit reviewed and the local changes made. Do not auto-update governance from an unreviewed upstream revision.
