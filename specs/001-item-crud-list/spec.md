# Feature Specification: Item CRUD and Listing

**Feature Branch**: `001-item-crud-list`  
**Created**: 2026-01-08  
**Status**: Draft  
**Input**: User description: "quiero poder crear el formulario para crear un nuevo item poder editar y eliminar al momento de crear que sea una nueva ruta por ejemplo http://localhost:3000/items/create y para editar http://localhost:3000/items/[id]/edit y para eliminar me salga un modal y eliminar ademas quiero que me aparezca una lista de 20 items y que pueda hacer paginacion hacer una busqueda por nombre aplicar filtro por fecha o estado"

## Clarifications

### Session 2026-01-08

- Q: Should item images be optional or required, and how many per item? → A: One optional image per item.
- Q: What should happen to the item image when the item is deleted? → A: Delete the image when the item is deleted.
- Q: What is the maximum allowed image size? → A: 5 MB per image.
- Q: Should the item list show an image thumbnail? → A: Show a small thumbnail in the list.
- Q: Which image formats should be allowed? → A: JPEG, PNG, and WebP.
- Q: What happens if a new image is uploaded during edit? → A: Replace the existing image with the new one.
- Q: Which date should the date filter use? → A: Filter by created date.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and find items (Priority: P1)

As a user, I want to view a list of items and quickly find what I need using search and filters so I can manage inventory efficiently.

**Why this priority**: Finding items is the primary daily task and enables all other actions.

**Independent Test**: Can be fully tested by opening the items list, applying search and filters, and confirming results without creating or editing items.

**Acceptance Scenarios**:

1. **Given** items exist, **When** I open the items list, **Then** I see the first 20 items and controls to move between pages.
2. **Given** the list is visible, **When** I search by item name, **Then** only matching items appear and the result count updates.
3. **Given** the list is visible, **When** I filter by date range and status, **Then** only items matching both filters appear.
4. **Given** no items match the current search or filters, **When** results load, **Then** I see an empty-state message with an option to clear filters.

---

### User Story 2 - Create a new item (Priority: P2)

As a user, I want a dedicated create-item page with a form so I can add new items accurately.

**Why this priority**: Creating items is essential to keeping the catalog up to date, but can be done after list access exists.

**Independent Test**: Can be fully tested by navigating to the create page, submitting the form, and confirming the item appears in the list.

**Acceptance Scenarios**:

1. **Given** I am on the create-item page, **When** I submit valid item details, **Then** the item is created and I receive a success confirmation.
2. **Given** I add an optional item image, **When** I submit the form, **Then** the item is created with the image attached.
3. **Given** I submit the form with missing or invalid data, **When** validation runs, **Then** I see clear field-level errors and the item is not created.

---

### User Story 3 - Edit or delete an item (Priority: P3)

As a user, I want to edit or delete an existing item so I can correct mistakes or remove items that are no longer needed.

**Why this priority**: Editing and deleting are important but less frequent than viewing and creating.

**Independent Test**: Can be fully tested by editing an existing item and deleting another with confirmation.

**Acceptance Scenarios**:

1. **Given** I open an item for editing, **When** I update and save changes, **Then** the item details are updated and reflected in the list.
2. **Given** I choose to delete an item, **When** I confirm the deletion in a modal, **Then** the item is removed and I see a confirmation message.

---

### Edge Cases

- What happens when the user navigates to a page number beyond the available results?
- How does the system handle an invalid date range (end date before start date)?
- What happens if an item cannot be deleted due to business constraints?
- How does the system handle simultaneous edits to the same item?
- What happens if image deletion fails after the item is deleted?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated list view of items that shows 20 items per page by default.
- **FR-001a**: Each list row MUST show a small thumbnail when an item has an image.
- **FR-002**: System MUST provide pagination controls to navigate through the item list.
- **FR-003**: Users MUST be able to search items by name using partial matches.
- **FR-004**: Users MUST be able to filter items by a date range based on the item creation date.
- **FR-004a**: Date range filtering MUST use the item created date.
- **FR-005**: Users MUST be able to filter items by status using the existing item status values.
- **FR-006**: Search and filters MUST be combinable and persist until cleared by the user.
- **FR-007**: System MUST provide a dedicated create-item page with a form to add a new item.
- **FR-008**: System MUST validate required fields and show clear, field-level errors on invalid input.
- **FR-009**: System MUST provide a dedicated edit-item page with pre-filled existing item details.
- **FR-010**: System MUST require explicit confirmation in a modal before deleting an item.
- **FR-011**: After create, edit, or delete actions, the list MUST reflect the updated items.
- **FR-012**: System MUST display an empty-state message when no items match the current search or filters.
- **FR-013**: Users MUST be able to upload one optional image when creating or editing an item.
- **FR-014**: System MUST store item images in the designated item image storage bucket named "items".
- **FR-015**: When an item is deleted, the system MUST delete its associated image if one exists.
- **FR-016**: System MUST reject item images larger than 5 MB and show a clear validation error.
- **FR-017**: System MUST accept only JPEG, PNG, or WebP images and reject other formats with a clear error.
- **FR-018**: When editing an item image, the new upload MUST replace the existing image.

### Non-Functional Requirements (Constitutional)

- **NFR-SEC-001**: System MUST enforce authentication/authorization on protected
  routes and validate RBAC permissions per operation (Admin, Bodeguero).
- **NFR-SEC-002**: System MUST sanitize inputs and handle file uploads securely.
- **NFR-SEC-003**: System MUST log audit events for critical operations.
- **NFR-DATA-001**: System MUST preserve referential integrity and use transactions
  for critical operations.
- **NFR-DATA-002**: System MUST validate NIC 2 accounting rules and maintain an
  append-only movement ledger.
- **NFR-DATA-003**: System MUST compute weighted average cost automatically.
- **NFR-UX-001**: System MUST provide clear loading/error states and real-time form
  validation.
- **NFR-UX-002**: System MUST confirm destructive actions and be responsive.
- **NFR-QUAL-001**: Critical accounting logic MUST be tested; complex functions MUST
  be documented.
- **NFR-QUAL-002**: System MUST handle errors robustly and optimize performance
  (lazy loading, streaming where applicable).

### Key Entities *(include if feature involves data)*

- **Item**: Represents a catalog item with name, status, creation date, and other business attributes.
- **Item Image**: Represents the optional image associated with a single item, including its storage location reference.
- **Item Status**: Represents the available status values used to classify items (e.g., active/inactive or equivalent domain statuses).

## Assumptions

- Item status values already exist in the domain and are reused in the filter.
- Date filtering applies to the item creation date and supports a start and end date.
- Users only see and manage items they are authorized to access.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new item from the list view to confirmation in under 2 minutes.
- **SC-002**: At least 90% of users can find a target item using search and filters within 1 minute.
- **SC-003**: 95% of delete attempts require explicit confirmation and complete with a clear success or failure message.
- **SC-004**: 99% of item list views display the first page of results within 3 seconds during normal business hours.
