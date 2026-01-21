# Feature Specification: Category CRUD and Access Control

**Feature Branch**: `001-category-crud-auth`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "quiero que hagas el crud de categorias basandote en como hiciste en items debe ser http://localhost:3000/categories/create para crear una categoria y http://localhost:3000/categories/[id]/edit para editar y http://localhost:3000/[id] para ver ademas debes validar que el usuario este autenticado para poder realizar cualquier accion o al ingresar a la pagina de categorias"

## Clarifications

### Session 2026-01-09

- Q: What is the correct URL path for viewing a category detail page? -> A: `/categories/[id]`.
- Q: Who can manage categories (create/edit/delete)? -> A: Admin and Bodeguero.
- Q: Should categories include a description field? -> A: Optional description.
- Q: What should happen when deleting a category that is in use by items? -> A: Allow deletion and leave items uncategorized.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and view categories (Priority: P1)

As an authenticated user, I can access the categories area, see the list of categories, and open a category detail page.

**Why this priority**: Users need to find and review categories before they can manage them.

**Independent Test**: Can be fully tested by signing in, opening the categories page, and viewing a category detail page.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they open the categories page, **Then** the category list is visible.
2. **Given** the user is authenticated and a category exists, **When** they open the category detail page, **Then** the category details are shown.
3. **Given** the user is not authenticated, **When** they try to open any categories page, **Then** they are blocked from access and prompted to sign in.

---

### User Story 2 - Create a category (Priority: P2)

As an authenticated user, I can create a new category from the create page.

**Why this priority**: Creating categories is essential for organizing items.

**Independent Test**: Can be fully tested by signing in and creating a category using the create form.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they submit valid category details on the create page, **Then** the category is created and appears in the list.
2. **Given** the user is authenticated, **When** they submit invalid or missing required fields, **Then** the system shows validation errors and does not create the category.

---

### User Story 3 - Edit or delete a category (Priority: P3)

As an authenticated user, I can edit an existing category and delete a category when it is no longer needed.

**Why this priority**: Users need to keep categories accurate and remove obsolete entries.

**Independent Test**: Can be fully tested by signing in, editing a category, and deleting a category from its detail or list actions.

**Acceptance Scenarios**:

1. **Given** the user is authenticated and a category exists, **When** they submit changes on the edit page, **Then** the updated details are saved and visible.
2. **Given** the user is authenticated and a category exists, **When** they confirm deletion, **Then** the category is removed from the list.

---

### Edge Cases

- What happens when a user tries to access a categories route without being authenticated?
- How does the system handle duplicate category names?
- What happens when a category is deleted while items are assigned to it?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST require authentication to access the categories list page.
- **FR-002**: System MUST require authentication to view, create, edit, or delete a category.
- **FR-002a**: Only Admin and Bodeguero roles MUST be allowed to create, edit, or delete categories.
- **FR-003**: System MUST provide a create category page at `/categories/create`.
- **FR-004**: System MUST provide an edit category page at `/categories/[id]/edit`.
- **FR-005**: System MUST provide a category detail page at `/categories/[id]`.
- **FR-006**: Users MUST be able to create a category with required fields validated before saving.
- **FR-007**: Users MUST be able to update category details.
- **FR-008**: Users MUST be able to delete a category, with a confirmation step.
- **FR-009**: System MUST prevent duplicate category names (case-insensitive) and show a clear error message.
- **FR-010**: System MUST allow deletion of a category that is in use and set affected items to have no category.

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

- **Category**: A classification for items; includes name and optional description.
- **User**: The authenticated actor performing category actions.

## Assumptions

- The categories list page exists at `/categories`.
- Category names are required and unique (case-insensitive).
- Deleting a category that is in use by items is allowed, and items become uncategorized.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authenticated users can create a category in under 1 minute.
- **SC-002**: At least 95% of category create/edit attempts succeed on first try when valid data is provided.
- **SC-003**: 100% of unauthenticated access attempts to categories pages are blocked.
- **SC-004**: Users can locate and open a category detail page in under 30 seconds.

