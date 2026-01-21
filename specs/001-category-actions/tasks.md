# Tasks: Category actions (edit/delete)

**Input**: Design documents from `/specs/001-category-actions/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Add permission resolution for categories and pass `canWrite` into the list table in `src/app/(dashboard)/categories/page.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI scaffolding required before user stories can be implemented

- [X] T002 [P] Extend `CategoryListTable` props to accept `canWrite` and add an actions column placeholder in `src/components/categories/category-list-table.tsx`
- [X] T003 [P] Create `CategoryActionsMenu` dropdown component shell in `src/components/categories/category-actions-menu.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Editar una categoria desde la lista (Priority: P1) (MVP)

**Goal**: Permitir navegar a la pantalla de edicion desde las acciones de cada categoria.

**Independent Test**: Desde la lista, abrir acciones y acceder a `/categories/{id}/edit` cuando el usuario tiene permiso de escritura.

### Implementation for User Story 1

- [X] T004 [US1] Add the Edit action link to `/categories/{id}/edit` in `src/components/categories/category-actions-menu.tsx`
- [X] T005 [US1] Render `CategoryActionsMenu` in each row (mobile and desktop) and pass `canWrite` in `src/components/categories/category-list-table.tsx`
- [X] T006 [US1] Hide the actions menu when `canWrite` is false in `src/components/categories/category-actions-menu.tsx`

**Checkpoint**: User Story 1 is independently functional

---

## Phase 4: User Story 2 - Eliminar una categoria con confirmacion (Priority: P2)

**Goal**: Permitir eliminar una categoria desde la lista con confirmacion y feedback visible.

**Independent Test**: Desde la lista, abrir el modal de eliminar, confirmar y ver la confirmacion en la lista; si ya fue eliminada, el modal se cierra sin mensaje.

### Implementation for User Story 2

- [X] T007 [US2] Add the Delete action to open `CategoryDeleteModal` from the actions menu in `src/components/categories/category-actions-menu.tsx`
- [X] T008 [US2] Update delete behavior to close silently on 404 and navigate to `/categories?deleted=1` on success in `src/components/categories/category-delete-modal.tsx`
- [X] T009 [US2] Show a success banner when `deleted=1` is present in the list page in `src/app/(dashboard)/categories/page.tsx`

**Checkpoint**: User Story 2 is independently functional

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T010 [P] Validate the quickstart smoke tests and adjust copy if needed in `specs/001-category-actions/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; no dependency on other stories
- **User Story 2 (P2)**: Starts after Foundational; can proceed after US1 or in parallel once the menu scaffold exists

---

## Parallel Example: User Story 2

```bash
# Parallel UI tasks for delete flow
Task: "Add the Delete action to open CategoryDeleteModal in src/components/categories/category-actions-menu.tsx"
Task: "Show a success banner when deleted=1 is present in src/app/(dashboard)/categories/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate User Story 1 independently

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 (MVP) then validate
3. User Story 2 then validate
4. Polish tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid cross-story dependencies that break independence
