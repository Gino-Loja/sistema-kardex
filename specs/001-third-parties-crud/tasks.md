---

description: "Task list template for feature implementation"
---

# Tasks: Third Parties Management

**Input**: Design documents from `/specs/001-third-parties-crud/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested; no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create third party types in `src/lib/types/terceros.ts`
- [x] T002 [P] Add third party validators (list query + form schemas) in `src/lib/validators/tercero.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement third party data access (list/get/create/update/soft delete + active filter) in `src/lib/data/terceros.ts`
- [x] T004 Implement third parties collection API (list/create) in `src/app/api/third-parties/route.ts`
- [x] T005 Implement third parties item API (get/update/delete) in `src/app/api/third-parties/[id]/route.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse third parties list (Priority: P1) MVP

**Goal**: Provide a paginated list of third parties (20 per page) with clear empty states.

**Independent Test**: Open the list, navigate pages, and confirm 20 rows per page with correct counts.

### Implementation for User Story 1

- [x] T006 [US1] Add search params loader for pagination in `src/app/(dashboard)/third-parties/search-params.ts`
- [x] T007 [US1] Build list table layout for third parties in `src/components/third-parties/third-party-list-table.tsx`
- [x] T008 [US1] Update list page to use data module, pagination controls, and table in `src/app/(dashboard)/third-parties/page.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Create a third party (Priority: P2)

**Goal**: Allow admins to create third parties via `/third-parties/create`.

**Independent Test**: Submit a valid form and confirm the new record appears in the list.

### Implementation for User Story 2

- [x] T009 [US2] Create third party form component with client validation in `src/components/third-parties/third-party-form.tsx`
- [x] T010 [US2] Add create page using the form in `src/app/(dashboard)/third-parties/create/page.tsx`

**Checkpoint**: User Story 2 is fully functional and testable independently

---

## Phase 5: User Story 3 - View, edit, or delete a third party (Priority: P3)

**Goal**: Provide view, edit, and delete actions with a confirmation modal for deletion.

**Independent Test**: Open a detail view, edit a record, and delete a record via modal; list reflects changes.

### Implementation for User Story 3

- [x] T011 [P] [US3] Add read-only detail page in `src/app/(dashboard)/third-parties/[id]/page.tsx`
- [x] T012 [P] [US3] Add edit page using the form in `src/app/(dashboard)/third-parties/[id]/edit/page.tsx`
- [x] T013 [P] [US3] Create delete confirmation modal in `src/components/third-parties/third-party-delete-modal.tsx`
- [x] T014 [US3] Create actions menu with view/edit/delete in `src/components/third-parties/third-party-actions-menu.tsx`
- [x] T015 [US3] Wire actions and permission gates into list table in `src/components/third-parties/third-party-list-table.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T016 [P] Review empty/error states for list and forms in `src/app/(dashboard)/third-parties/page.tsx`
- [ ] T017 [P] Run quickstart validation in `specs/001-third-parties-crud/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - builds on shared data/API foundation
- **User Story 3 (P3)**: Can start after Foundational - integrates with list and form components

### Within Each User Story

- Shared modules before UI components
- Form component before create/edit pages
- Delete modal before actions menu

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T011, T012, and T013 can run in parallel (different files)
- Polish tasks can run in parallel after stories complete

---

## Parallel Example: User Story 3

```bash
Task: "Add read-only detail page in src/app/(dashboard)/third-parties/[id]/page.tsx"
Task: "Add edit page in src/app/(dashboard)/third-parties/[id]/edit/page.tsx"
Task: "Create delete confirmation modal in src/components/third-parties/third-party-delete-modal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate list pagination and empty states

### Incremental Delivery

1. Setup + Foundational ready
2. User Story 1 -> validate list
3. User Story 2 -> validate create flow
4. User Story 3 -> validate view/edit/delete
5. Polish and quickstart validation

---

## Notes

- [P] tasks = different files, no dependencies
- Each user story is independently completable and testable
- Routes must follow `/third-parties/create` and `/third-parties/[id]/edit`
- Delete is soft delete (set inactive, hide from list by default)
