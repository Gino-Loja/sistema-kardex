---

description: "Task list for Refine Item UI"
---

# Tasks: Refine Item UI

**Input**: Design documents from `specs/001-refine-item-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested; no new test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm baseline UI locations for the feature

- [x] T001 Review current list/detail layout targets in `src/components/items/item-list-table.tsx` and `src/app/(dashboard)/items/[id]/page.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared UI building blocks used by multiple stories

- [x] T002 Create shared overflow actions menu in `src/components/items/item-actions-menu.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Revisar items sin miniaturas (Priority: P1) ?? MVP

**Goal**: Remove thumbnails from the item list while keeping data readable

**Independent Test**: Load the items list and confirm no image/thumbnail appears in either mobile or desktop layout

### Implementation for User Story 1

- [x] T003 [US1] Remove thumbnail/placeholder block from mobile list layout in `src/components/items/item-list-table.tsx`
- [x] T004 [US1] Remove image column and update grid headers/columns in desktop table in `src/components/items/item-list-table.tsx`
- [x] T005 [US1] Adjust spacing after thumbnail removal to keep row alignment clean in `src/components/items/item-list-table.tsx`

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Ver detalle con imagen grande y datos utiles (Priority: P2)

**Goal**: Make the detail image prominent and emphasize existing item fields

**Independent Test**: Open an item detail page and verify the image is large and all required fields are shown with stronger visual hierarchy

### Implementation for User Story 2

- [x] T006 [US2] Increase detail image size and placeholder styling in `src/app/(dashboard)/items/[id]/page.tsx`
- [x] T007 [US2] Expand the detail info grid with emphasized existing fields (codigo, descripcion, categoria, unidad, estado, costoPromedio, creadoEn, actualizadoEn) in `src/app/(dashboard)/items/[id]/page.tsx`
- [x] T008 [US2] Align `ItemDetail` typing with displayed fields in `src/lib/types/items.ts`

**Checkpoint**: User Story 2 is functional and independently testable

---

## Phase 5: User Story 3 - Acciones faciles de usar en pantalla reducida (Priority: P3)

**Goal**: Provide responsive actions via an overflow menu on small screens

**Independent Test**: At 320px-767px width, actions open from an overflow menu without overlap; on desktop, actions remain visible inline

### Implementation for User Story 3

- [x] T009 [US3] Replace mobile action links with the overflow menu trigger in `src/components/items/item-list-table.tsx`
- [x] T010 [US3] Wire action entries (ver/actualizar/eliminar) and accessible labels in `src/components/items/item-actions-menu.tsx`

**Checkpoint**: User Story 3 is functional and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation alignment

- [ ] T011 Run and validate quickstart steps in `specs/001-refine-item-ui/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - no dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational - no dependencies on other stories

### Within Each User Story

- Implement UI changes in the listed order
- Avoid overlapping edits in the same file across tasks

### Parallel Opportunities

- After Foundational completion, User Stories 1-3 can proceed in parallel if staffed
- No parallel tasks within a single story due to shared files

---

## Parallel Example: User Story 1

```bash
# Run US1 after foundations are complete:
Task: "Remove thumbnail/placeholder block from mobile list layout in src/components/items/item-list-table.tsx"
Task: "Remove image column and update grid headers/columns in desktop table in src/components/items/item-list-table.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify no thumbnails are shown in the list

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo
3. Add User Story 2 → Test independently → Demo
4. Add User Story 3 → Test independently → Demo
5. Final polish and quickstart validation

### Parallel Team Strategy

- Developer A: User Story 1
- Developer B: User Story 2
- Developer C: User Story 3

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid overlapping edits in `src/components/items/item-list-table.tsx`
