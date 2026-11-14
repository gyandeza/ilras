# ILRAS Design Direction

**Document role:** Product-specific visual direction for ILRAS. This records the design system already present in the canonical frontend source. It is not permission to redesign the product or change the design tokens without review.

## Product identity

- **Product:** Industrial Logistics Readiness Assessment System (ILRAS).
- **Product character:** Government-oriented industrial planning and logistics decision-support system.
- **Primary users:** Bappeda analysts, government planning officials, and industrial logistics stakeholders.
- **Primary job:** Explain which pilot district is ready, why its readiness score has that value, which dimensions drive the result, what evidence supports the score, and how a clearly labelled scenario changes the result.
- **Design priorities:** Analytical clarity, explainability, geographic context, evidence provenance, auditability, and operational readability.
- **Not a marketing site:** Avoid SaaS landing-page conventions when designing operational screens.

## Visual language

Institutional, analytical, geographic, restrained, and evidence-led. The interface should feel like a dependable public-sector decision-support workspace, not a generic AI dashboard or a consumer application.

The visual language must support comparison, reading dense information, understanding spatial relationships, and tracing a score back to its evidence.

## Existing visual system

These values are already implemented in `ilras-frontend/src/styles/tokens.css`. Preserve them unless a separately reviewed design decision approves a change.

### Core palette

- Deep navy: `#0B2545`
- Primary blue: `#1B4B8F`
- Primary tint: `#E8EEF7`
- Teal accent: `#0E7C7B`
- Surface: `#F7F9FC`
- Ink: `#101828`
- Muted text: `#5B6472`
- Divider: `#E3E8F0`

### Semantic readiness colors

- Sangat Siap: `#1B7A4A`
- Siap: `#3E9C6E`
- Cukup Siap: `#C98A1B`
- Kurang Siap: `#D2691E`
- Belum Siap: `#B3261E`

These colors carry readiness meaning. Do not reuse them decoratively or change their semantic mapping casually.

### Typography

- Headings: Plus Jakarta Sans
- Body and interface text: Inter
- Numeric and technical data: IBM Plex Mono

The typefaces have distinct roles. Do not use monospace for large headings by default.

### Layout and component character

- Existing spacing is based on an 8px grid.
- Existing card radius token is 12px.
- Pill radius is reserved for elements whose semantics justify it, such as compact status or band labels.
- Data surfaces remain legible and predominantly opaque.
- Glassmorphism is restricted to application chrome where the existing implementation uses it. Do not spread blur effects across data cards, tables, maps, or analysis panels.
- Maps, charts, score rings, dimension bars, timelines, and evidence panels should each use the composition that best explains their content. Do not force them into identical cards.

## Liveliness dials

Default direction for operational ILRAS screens:

- **ENERGY 1 (Calm):** restrained, confident, information-first.
- **RHYTHM 2 (Balanced):** consistent navigation and analytical patterns, with deliberate composition changes for maps, rankings, charts, and evidence.
- **MOTION 1 (Minimal):** purposeful hover, focus, and state transitions only. Respect `prefers-reduced-motion`.

These dials are a product default, not an instruction to make every screen identical. A public-facing showcase or a distinct experience may require a separately approved Design Read.

## Identity motifs

Use product-specific analytical motifs already inherent in ILRAS:

- ILRI score ring and readiness band as a compact summary of district readiness.
- Seven-dimension profile as the explanatory signature of the composite score.
- Map and district boundary as geographic context, with precision and source limitations disclosed.
- Evidence and provenance labels connecting source, indicator, dimension, score, and methodology version.
- Observed history visually separated from hypothetical scenario results.

Do not add decorative motifs that imply data, precision, connectivity, or geographic coverage that the system has not verified.

## Content and evidence rules

- UI and reports are in Bahasa Indonesia.
- Every displayed metric must have a known source, definition, unit, period, and status where applicable.
- Distinguish verified data, provisional data, illustrative placeholders, and hypothetical simulation.
- Do not invent map layers, district boundaries, indicator values, forecasts, benchmarks, or confidence levels.
- Do not imply that an approximate coordinate or cached geometry is a verified administrative boundary.
- Use honest empty, loading, and error states.

## Design Read template

Before each UI task, record:

> Reading this as: `<page or component>` for `<audience>`, in an institutional analytical geographic language, dial ENERGY `<1-3>` / RHYTHM `<1-3>` / MOTION `<1-3>`.

Then state the screen's primary user question, focal point, data evidence, and reason for each non-obvious visual technique.
