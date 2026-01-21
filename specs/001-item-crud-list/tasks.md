---

description: "Task list template for feature implementation"
---

# Tasks: Item CRUD and Listing

**Input**: Design documents from `/specs/001-item-crud-list/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in spec; no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below reflect the current repository structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create item feature folders `C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\items\` and `C:\Users\ginol\Desktop\projects\sistema-kardex\src\hooks\items\`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**?? CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create item validation schemas in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\validators\item.ts`
- [x] T003 [P] Add shared item types (filters, pagination, DTOs) in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\types\items.ts`
- [x] T004 [P] Implement MinIO client wrapper in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\storage\minio.ts`
- [x] T005 [P] Implement item image storage service (upload/delete/validate) in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\services\item-image.ts`
- [x] T006 Implement item data access (list/get/create/update/delete) in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\data\items.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse and find items (Priority: P1) ?? MVP

**Goal**: List items with pagination, search, status/date filters, and thumbnails.

**Independent Test**: Open items list, apply search and filters, paginate, and see empty-state when no results.

### Implementation for User Story 1

- [x] T007 [US1] Implement list API GET in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\api\items\route.ts`
- [x] T008 [P] [US1] Build list filters UI in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\items\item-filters.tsx`
- [x] T009 [P] [US1] Build list table UI with thumbnail column in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\items\item-list-table.tsx`
- [x] T010 [P] [US1] Add filter/pagination state hook in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\hooks\items\use-items-filters.ts`
- [x] T011 [US1] Wire list page to API, filters, pagination, and empty state in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\(dashboard)\items\page.tsx`

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Create a new item (Priority: P2)

**Goal**: Create items via a dedicated route with optional image upload.

**Independent Test**: Navigate to create page, submit valid data (with optional image), and see the item in the list.

### Implementation for User Story 2

- [x] T012 [P] [US2] Build reusable item form component in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\items\item-form.tsx`
- [x] T013 [US2] Add create route page in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\(dashboard)\items\create\page.tsx`
- [x] T014 [US2] Implement create API POST (multipart + image upload) in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\api\items\route.ts`
- [x] T015 [US2] Enforce client-side image constraints in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\items\item-form.tsx`
- [x] T016 [US2] Add success/error feedback and redirect to list in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\(dashboard)\items\create\page.tsx`

**Checkpoint**: User Story 2 is fully functional and independently testable

---

## Phase 5: User Story 3 - Edit or delete an item (Priority: P3)

**Goal**: Edit item details, replace image, and delete items with confirmation.

**Independent Test**: Edit an existing item and delete another with a confirmation modal.

### Implementation for User Story 3

- [x] T017 [US3] Implement item GET by id in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\api\items\[id]\route.ts`
- [x] T018 [US3] Implement item PATCH (multipart + image replace) in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\api\items\[id]\route.ts`
- [x] T019 [US3] Implement item DELETE (including image delete) in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\api\items\[id]\route.ts`
- [x] T020 [P] [US3] Add edit route page in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\(dashboard)\items\[id]\edit\page.tsx`
- [x] T021 [US3] Load item into form and handle image replacement in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\items\item-form.tsx`
- [x] T022 [US3] Add delete confirmation modal in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\items\item-delete-modal.tsx` and wire in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\(dashboard)\items\[id]\edit\page.tsx`

**Checkpoint**: User Story 3 is fully functional and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T023 [P] Add loading and error boundaries in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\(dashboard)\items\loading.tsx` and `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\(dashboard)\items\error.tsx`
- [x] T024 [P] Update navigation to include items list in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\navigation\panel-pages.ts` and `C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\layout\app-sidebar.tsx`
- [x] T025 [P] Update quickstart verification steps if needed in `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-item-crud-list\quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent but uses shared form/components
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses shared form/components and item APIs

### Within Each User Story

- Data/API handlers before wiring UI
- Shared components before page integration
- Story complete before moving to next priority

### Parallel Opportunities

- Foundational: T003, T004, T005 can run in parallel
- User Story 1: T008, T009, T010 can run in parallel
- User Story 2: T012 can run in parallel with T013 (page shell) after T002
- User Story 3: T020 can run in parallel with API handlers T017-T019 after T002

---

## Parallel Example: User Story 1

```bash
Task: "Build list filters UI in C:\\Users\\ginol\\Desktop\\projects\\sistema-kardex\\src\\components\\items\\item-filters.tsx"
Task: "Build list table UI with thumbnail column in C:\\Users\\ginol\\Desktop\\projects\\sistema-kardex\\src\\components\\items\\item-list-table.tsx"
Task: "Add filter/pagination state hook in C:\\Users\\ginol\\Desktop\\projects\\sistema-kardex\\src\\hooks\\items\\use-items-filters.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. STOP and validate User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Demo
3. Add User Story 2 -> Test independently -> Demo
4. Add User Story 3 -> Test independently -> Demo

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid vague tasks and cross-story dependencies that break independence
