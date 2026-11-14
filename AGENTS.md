# ILRAS Agent Instructions

## Project authority

- This repository is the canonical engineering source for ILRAS.
- Preserve the seven ILRI dimensions and the current equal-weight methodology unless an approved methodology decision explicitly changes them.
- Never invent indicator values, indicator-to-dimension aggregation, historical observations, forecasts, investment impacts, costs, or source provenance.
- Keep observed data and hypothetical simulation outputs separate.
- Keep the backend ILRI engine as the single scoring authority. Do not calculate a second composite score in the frontend.
- UI language and user-facing reports are Bahasa Indonesia unless a product decision says otherwise.
- A deployed demo is not evidence of production readiness.

## Before UI or visual work

Read these files in order:

1. `DESIGN.md` for ILRAS visual direction and existing design tokens.
2. `docs/ILRAS_ANTISLOP_GOVERNANCE_v1.md` for the adapted Anti-Slop rules, Design Read, and mandatory delivery gate.

For detailed accessibility or responsive work, apply the relevant checklists in the governance document. The upstream Anti-Slop project contains additional specialist skills; do not assume those skills are installed in this repository.

## Working mode

For UI implementation, apply the governance while planning and building (During mode). If the user explicitly requests an audit of an already completed UI without edits, use After mode: report numbered findings first and wait for approval before changing code.

Before UI implementation, state a concise Design Read with page kind, audience, visual language, and ENERGY / RHYTHM / MOTION dials. Do not start visual implementation if the product direction is materially ambiguous; ask one decisive question.

## Delivery

- Do not claim a UI task is complete until the relevant delivery gate has concrete evidence.
- Report PASS / FAIL for each applicable gate. A FAIL blocks delivery.
- Run frontend lint and production build for frontend changes.
- Verify changed interactions and relevant loading, empty, and error states.
- Do not change production deployment, database state, authentication, scoring methodology, or data governance as an incidental part of a UI task.
