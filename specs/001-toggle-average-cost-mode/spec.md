# Feature Specification: Toggle Average Cost Calculation Mode

**Feature Branch**: `001-toggle-average-cost-mode`  
**Created**: 2026-01-18
**Status**: Draft  
**Input**: User description: "quiero que me salga un boton en http://localhost:3000/warehouses/48d64bc5-d7be-4911-808b-9a741ccdf393 de que permita o no la actualizacion del costo promedio es decir si le dejo manual cada vez que yo realice un movimiento de entrada debo actualizarlo yo manualmente el costo promedio pero esto permitira poder hacer que el sistema lo haga automaticamente el costo promedio es el que esta en la tabla item_bodegas el campo costoPromedio."

## Clarifications

### Session 2026-01-18

- Q: What should be the default calculation mode for newly created warehouses, and what initial mode should be set for all existing warehouses once this feature is deployed? → A: Default to 'Manual' for all.
- Q: How should the system inform the user that the change was successful or if it failed? → A: No notification on success; only show an error message on failure.
- Q: Are there any specific requirements for logging or auditing related to changes in the average cost calculation mode or the execution/failure of automatic average cost calculations? → A: Only log failures of automatic average cost calculations for debugging purposes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Warehouse Average Cost Mode (Priority: P1)

A warehouse manager needs the ability to switch the average cost calculation method between "Automatic" and "Manual" for each warehouse individually. This control is essential for operational flexibility, allowing for automated, efficient cost updates in most cases, while preserving the option for manual control to handle special-case inventory entries or correct discrepancies.

**Why this priority**: This is the core functionality requested and provides a fundamental control mechanism for inventory costing, which is a critical business process.

**Independent Test**: This can be tested by navigating to a single warehouse's detail page, changing the setting, and then creating an inbound movement for an item in that warehouse. The test is successful if the `costoPromedio` in the `item_bodegas` table behaves as expected for the chosen mode (updates in "Automatic", remains unchanged in "Manual").

**Acceptance Scenarios**:

1. **Given** a warehouse is set to "Automatic" mode, **When** an inbound inventory movement is recorded for an item in that warehouse, **Then** the system automatically recalculates and updates the `costoPromedio` for that item in that warehouse.
2. **Given** a warehouse is set to "Manual" mode, **When** an inbound inventory movement is recorded for an item in that warehouse, **Then** the `costoPromedio` for that item in that warehouse remains unchanged.
3. **Given** a user is viewing the details page of a warehouse, **When** they activate the "Automatic Update" toggle, **Then** the system saves the setting for that warehouse and the UI control shows the "on" state.
4. **Given** a user is viewing the details page of a warehouse, **When** they deactivate the "Automatic Update" toggle, **Then** the system saves the setting for that warehouse and the UI control shows the "off" state.

---

### Edge Cases

- **What happens if** the calculation for the average cost results in an error in "Automatic" mode? The transaction should be rolled back, and an error message should be displayed to the user.
- **How does the system handle** a user attempting to change the mode while an inbound movement is being processed for that same warehouse? The toggle action should either be disabled or a locking mechanism should prevent a race condition.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a UI control (e.g., a switch or toggle) on each warehouse's detail page (`/warehouses/{id}`) to manage the average cost calculation mode.
- **FR-002**: The system MUST persist the selected mode (Automatic/Manual) for each warehouse. This will likely require adding a new boolean field, such as `auto_update_average_cost`, to the `bodegas` (warehouses) table.
- **FR-003**: When a user changes the setting via the UI control, the system MUST immediately update and save the new mode for the specific warehouse.
- **FR-004**: The UI control MUST accurately reflect the currently saved mode for the warehouse upon loading the page.
- **FR-005**: If a warehouse's mode is "Automatic", the system MUST trigger a recalculation of the `costoPromedio` in the `item_bodegas` table for the relevant item whenever a new inbound movement (`movimiento de entrada`) is successfully created for that warehouse.
- **FR-006**: If a warehouse's mode is "Manual", the system MUST NOT perform any automatic recalculation of the `costoPromedio` following an inbound movement.
- **FR-007**: The default calculation mode for all new and existing warehouses MUST be 'Manual'.
- **FR-008**: The system MUST display an error message only if the change to the average cost calculation mode fails, and MUST NOT display an explicit success notification.
- **FR-009**: The system MUST log failures of automatic average cost calculations for debugging purposes.

### Key Entities 

- **Warehouse (`bodega`)**: Represents a storage location for items.
  - Key Attributes: `id`, `name`, `auto_update_average_cost` (new boolean attribute).
- **ItemWarehouse (`item_bodega`)**: A join table representing an item's status within a specific warehouse.
  - Key Attributes: `itemId`, `bodegaId`, `stock`, `costoPromedio`.
- **Movement (`movimiento`)**: Records the transaction of items into or out of a warehouse.
  - Key Attributes: `id`, `type` (e.g., 'entrada'), `itemId`, `bodegaId`, `quantity`, `cost`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can view and change the average cost calculation mode for any given warehouse in less than 15 seconds from the warehouse detail page.
- **SC-002**: The system correctly applies the selected calculation mode in 100% of inbound movement transactions, verifiable through logs or database checks.
- **SC-003**: The state of the UI toggle for the calculation mode must match the persisted state in the database for a given warehouse with 100% accuracy on page load.
- **SC-004**: The introduction of this feature must not increase the average processing time for inbound movements by more than 10%.