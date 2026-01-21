# Research Notes: Refine Item UI

## Decisions

- Decision: Use an overflow menu for row actions on small screens and keep actions visible on desktop.
  Rationale: Prevents overlap at 320px-767px while preserving quick access on larger screens.
  Alternatives considered: Horizontal scroll of icons; wrapping icons into multiple rows.

- Decision: Emphasize existing item fields in the detail view instead of adding new fields.
  Rationale: Clarification confirms more visual hierarchy rather than new data.
  Alternatives considered: Adding new attributes to the detail view.

- Decision: Keep item detail image large enough to be visible without zoom and fit within the viewport width on small screens.
  Rationale: Aligns with success criteria and avoids horizontal scroll.
  Alternatives considered: Fixed pixel sizes; modal-only image view.

- Decision: No new API contracts required; UI consumes existing item list/detail data.
  Rationale: Feature is a UI refinement without new data flows.
  Alternatives considered: Adding new endpoints or payload fields.
