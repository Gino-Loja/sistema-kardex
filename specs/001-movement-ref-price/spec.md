# Feature Specification: Movimiento con Precio de Referencia

## 1. Overview

This document outlines the requirements for ensuring that item movements (entrada y salida) correctly display and utilize the reference price, specifically the `costoPromedio` stored for an item in a specific `bodega`. The current system exhibits an issue where,despite an item having a `costoPromedio` (displayed as "Costo unitario" in the UI) of 50 in `bodega BO-01`, a "Sin precio de referencia" error appears during "salida" movements. Additionally, the system fails to update the cost when a different item is selected, retaining the previous item's cost.

## Clarifications

### Session 2026-01-19

- Q: How should the system visually indicate that the cost for an item is being fetched? → A: Disable the cost input field and show a spinner inside it
- Q: How should the system handle a `costoPromedio` that is negative? → A: Treat negative costs as 0 and show the "Sin precio de referencia" warning
- Q: What is the maximum acceptable delay for the cost to be displayed after an item is selected? → A: 500ms
- Q: What is the approximate number of items that could be in a single `bodega`? → A: Up to 1,000 items
- Q: What is the expected behavior if two users open the same movement for editing simultaneously? → A: The first user to save their changes wins, and the second user gets an error message.

## 2. Goals

- **Ensure correct display of reference price:** The system must accurately show the `costoPromedio` (unit cost) for an item within a specific `bodega` during movement creation.
- **Eliminate "Sin precio de referencia" error:** The warning should not appear when a valid `costoPromedio` exists for the item in the selected `bodega`.
- **Maintain correct cost upon item selection:** When a new item is selected in a movement detail line, its `costoPromedio` should be correctly loaded and displayed, replacing any previously displayed cost.

## 3. Non-Goals

- Implementing a new costing method.
- Changing how `costoPromedio` is calculated or stored.
- Modifying the item or `bodega` inventory management outside of movement creation.

## 4. User Roles and Permissions

This feature primarily affects users responsible for managing inventory movements (e.g., Warehouse Managers, Inventory Clerks). No new roles or permission changes are required. Users must have existing permissions to create and edit movements.

## 5. User Scenarios & Testing

### Scenario 1: Crear movimiento de Salida con item que tiene costoPromedio

**Given** I am creating a "Salida" movement
**And** I select "BO-01" as the origin `bodega`
**And** "Llantas" (ID: XYZ) has a `costoPromedio` of 50 in `bodega BO-01`
**When** I add "Llantas" to the movement details
**Then** The "Costo Unit." field for "Llantas" should display "50"
**And** The "Sin precio de referencia" warning should **not** be displayed

### Scenario 2: Crear movimiento de Entrada con item que tiene costoPromedio

**Given** I am creating an "Entrada" movement
**When** I add "Llantas" to the movement details
**Then** The "Costo Unit." field for "Llantas" should display its global `costoPromedio` (if available) or 0 if not.
**And** If the global `costoPromedio` is 0, the "Sin precio de referencia" warning should be displayed.

### Scenario 3: Cambiar item en la línea de detalle de movimiento

**Given** I am creating a movement
**And** I have "Llantas" selected in a detail line with a "Costo Unit." of 50
**When** I change the item in that same detail line to "Frenos" (ID: ABC)
**And** "Frenos" has a `costoPromedio` of 30 in `bodega BO-01` (if Salida/Transferencia) or a global `costoPromedio` of 30 (if Entrada)
**Then** The "Costo Unit." field for "Frenos" should display "30"
**And** The "Sin precio de referencia" warning should be updated based on "Frenos'" `costoPromedio`

## 6. Functional Requirements

- **FR1:** The movement creation form shall dynamically retrieve and display the `costoPromedio` for selected items based on the movement type and associated `bodega`(s).
- **FR2:** For "Salida" and "Transferencia" movements, the `costoPromedio` displayed in the "Costo Unit." field for an item shall correspond to the item's `costoPromedio` within the selected origin `bodega`.
- **FR3:** For "Entrada" movements, the `costoPromedio` displayed in the "Costo Unit." field for an item shall correspond to the item's global `costoPromedio`.
- **FR4:** The system shall suppress the "Sin precio de referencia" warning when `isLoadingCosts` is true (i.e., while item costs are being fetched).
- **FR5:** The system shall display the "Sin precio de referencia" warning only when both the item's `costoPromedio` in the relevant `bodega` (for "Salida"/"Transferencia") or its global `costoPromedio` (for "Entrada") and the item's global `costoPromedio` (for "Salida"/"Transferencia" fallback) are zero.
- **FR6:** When an item is changed in a movement detail line, the associated "Costo Unit." field and "Sin precio de referencia" warning shall be updated to reflect the newly selected item's `costoPromedio` and stock status.
- **FR7:** If the retrieved `costoPromedio` for an item is negative, it shall be treated as 0 for all display and calculation purposes, and the "Sin precio de referencia" warning shall be shown.

## 7. Non-Functional Requirements

- **NFR1 - Performance:** The retrieval and display of item costs must complete within 500ms after an item is selected.
- **NFR2 - Usability:** The user interface for cost display and warnings should be clear and intuitive. While item costs are being fetched, the "Costo Unit." input field will be disabled and display a spinner internally.
- **NFR3 - Concurrency:** If two users attempt to save edits to the same movement simultaneously, the first user to save will succeed, and the second user will receive an error message indicating that their changes could not be saved due to a conflict.

## 8. Data Model Changes

No changes to the existing data model are anticipated. The feature will rely on the `items` and `item_bodegas` schemas.

## 9. Technical Details (High-Level)

The current implementation uses `useAverageCost` hook and `hasZeroCostWarning` function in `movement-form.tsx`. The solution will involve refining the logic within these components to ensure proper timing of cost retrieval and accurate display of warnings based on the `isLoadingCosts` state and actual `costoPromedio` values.

## 10. Assumptions

- The `costoPromedio` in `item_bodegas` accurately reflects the weighted average cost for an item within a specific `bodega`.
- The `costoPromedio` in `items` represents a global reference cost for the item.
- The `isLoadingCosts` state of the `useAverageCost` hook accurately reflects whether cost data is currently being fetched.
- A single `bodega` can contain up to 1,000 items.

## 11. Open Questions / [NEEDS CLARIFICATION]

None.

## 12. Future Considerations

- Implement real-time validation of stock and cost during movement creation for more immediate feedback.
- Provide a clear visual indicator for items whose costs are still loading.

## 13. Success Criteria

- 100% of "Salida" and "Transferencia" movements created for items with a non-zero `costoPromedio` in the origin `bodega` do not display the "Sin precio de referencia" warning.
- The "Costo Unit." field consistently reflects the correct `costoPromedio` (either `bodega`-specific or global) for selected items across all movement types.
- When an item is changed in a movement detail, its cost is updated within 500ms.
- User satisfaction surveys indicate that at least 90% of users report no confusion regarding the "Sin precio de referencia" warning during movement creation.

---