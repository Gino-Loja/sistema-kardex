# Tasks for Movimiento con Precio de Referencia

This document outlines the tasks required to implement the "Movimiento con Precio de Referencia" feature.

## Phase 1: Foundational

- [x] T001 [P] Modify the `useAverageCost` hook in `src/hooks/movements/use-average-cost.ts` to ensure `isLoading` is always set to `false` after the fetch operation, even if there are no item IDs to fetch.

## Phase 2: User Story 1 - Salida Movement

**Goal**: As a user, when creating a "Salida" movement, I want to see the correct `costoPromedio` for an item from the selected `bodega`.
**Independent Test Criteria**: A "Salida" movement for an item with a `costoPromedio` of 50 should display "50" in the "Costo Unit." field without a "Sin precio de referencia" warning.

- [x] T002 [US1] In `src/components/movements/movement-form.tsx`, update the `hasZeroCostWarning` function to not show a warning while `isLoadingCosts` is `true`.
- [x] T003 [US1] In `src/components/movements/movement-form.tsx`, ensure the "Costo Unit." input field is disabled and shows a spinner while `isLoadingCosts` is `true`.

## Phase 3: User Story 2 - Entrada Movement

**Goal**: As a user, when creating an "Entrada" movement, I want to see the global `costoPromedio` for an item.
**Independent Test Criteria**: An "Entrada" movement for an item with a global `costoPromedio` of 30 should display "30" in the "Costo Unit." field.

- [x] T004 [US2] In `src/components/movements/movement-form.tsx`, verify that the logic for "Entrada" movements correctly falls back to the item's global `costoPromedio`.

## Phase 4: User Story 3 - Changing Items

**Goal**: As a user, when changing an item in a movement detail line, I want the cost to update automatically.
**Independent Test Criteria**: When changing from an item with a cost of 50 to an item with a cost of 30, the "Costo Unit." field should update to "30" within 500ms.

- [x] T005 [US3] In `src/components/movements/movement-form.tsx`, ensure the `useEffect` that updates costs based on `averageCosts` correctly updates the `costoUnitario` for the corresponding detail line.

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T006 [P] In `src/components/movements/movement-form.tsx`, modify the cost retrieval logic to treat negative `costoPromedio` values as 0 and trigger the "Sin precio de referencia" warning.
- [x] T007 [P] Implement the "first user to save wins" concurrency model for editing movements. This will likely require changes in the submission logic in `src/components/movements/movement-form.tsx` and the corresponding API endpoint.

## Dependencies

- **US2** depends on **US1** (as they modify the same component).
- **US3** depends on **US1** and **US2**.

## Parallel Execution

- **T001**, **T006**, and **T007** can be worked on in parallel with other tasks.

## Implementation Strategy

The implementation will follow the phases outlined above, starting with the foundational fix in the `useAverageCost` hook. Each user story will then be addressed incrementally. Given the nature of the changes (refining existing logic), it's recommended to implement and test each phase sequentially to avoid conflicts.
