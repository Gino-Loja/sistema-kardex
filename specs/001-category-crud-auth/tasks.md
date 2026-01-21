---

description: "Task list for feature implementation"
---

# Tasks: Category CRUD and Access Control

**Input**: Design documents from `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-category-crud-auth\`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested for this feature. Add only if needed during implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/`
- Paths below are relative to `C:\Users\ginol\Desktop\projects\sistema-kardex\`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared access control updates

- [X] T001 Update category route permissions in `src/lib/auth/route-permissions.ts`
- [X] T002 Update role permissions so Admin and Bodeguero can write masters in `src/lib/auth/roles.ts` and `src/lib/auth/permissions.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data model and validation updates required by all user stories

- [X] T003 Add optional description field to category schema and migration in `src/lib/drizzle/schemas/categorias.ts` and `src/lib/drizzle/migrations/0004_add_categoria_descripcion.sql`
- [X] T004 Update category validation and types for description support in `src/lib/validations/masters.ts`, `src/lib/validators/categoria.ts`, and `src/lib/types/categorias.ts`
- [X] T005 Update category repository and data access for description field in `src/lib/dal/repositories/categorias.repository.ts` and `src/lib/data/categorias.ts`
- [X] T006 Ensure category API routes accept/return description in `src/app/api/categories/route.ts` and `src/app/api/categories/[id]/route.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Browse and view categories (Priority: P1)

**Goal**: Authenticated users can access the categories list and open a detail page.

**Independent Test**: Sign in, visit `/categories`, open a category detail page and verify fields display.

### Implementation for User Story 1

- [X] T007 [US1] Update list page to remove inline create form and add create CTA in `src/app/(dashboard)/categories/page.tsx`
- [X] T008 [P] [US1] Add detail links and display description in list rows in `src/components/categories/category-list-table.tsx`
- [X] T009 [US1] Add detail page at `src/app/(dashboard)/categories/[id]/page.tsx` using `getCategoriaById`

**Checkpoint**: Category list and detail views are functional and authenticated

---

## Phase 4: User Story 2 - Create a category (Priority: P2)

**Goal**: Authenticated users can create categories from `/categories/create`.

**Independent Test**: Sign in, submit a valid form on `/categories/create`, verify new category appears in list.

### Implementation for User Story 2

- [X] T010 [US2] Refactor form to support description and reusable submit handler in `src/components/categories/category-form.tsx`
- [X] T011 [US2] Create page at `src/app/(dashboard)/categories/create/page.tsx` using `CategoryForm` and POST `/api/categories`
- [X] T012 [US2] Add navigation back to list on create page in `src/app/(dashboard)/categories/create/page.tsx`

**Checkpoint**: Create flow works and list refreshes with new category

---

## Phase 5: User Story 3 - Edit or delete a category (Priority: P3)

**Goal**: Authenticated users can edit and delete existing categories.

**Independent Test**: Sign in, edit a category at `/categories/[id]/edit`, then delete it and confirm items become uncategorized.

### Implementation for User Story 3

- [X] T013 [US3] Create edit page at `src/app/(dashboard)/categories/[id]/edit/page.tsx` using `CategoryForm` and PATCH `/api/categories/[id]`
- [X] T014 [P] [US3] Add delete confirmation modal in `src/components/categories/category-delete-modal.tsx`
- [X] T015 [US3] Add edit/delete actions to detail page in `src/app/(dashboard)/categories/[id]/page.tsx`
- [X] T016 [US3] Wire delete modal to DELETE `/api/categories/[id]` and refresh UI in `src/components/categories/category-delete-modal.tsx`

**Checkpoint**: Edit and delete flows work with confirmation and proper redirects

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and consistency updates across stories

- [X] T017 [P] Add loading/empty state copy updates for category pages in `src/app/(dashboard)/categories/page.tsx` and `src/app/(dashboard)/categories/[id]/page.tsx`
- [X] T018 [P] Validate and update quickstart instructions in `specs/001-category-crud-auth/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on completion of user stories being delivered

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase
- **User Story 2 (P2)**: Can start after Foundational phase
- **User Story 3 (P3)**: Can start after Foundational phase

### Parallel Opportunities

- T001 and T002 can run in parallel
- T003, T004, and T005 can run in parallel after T001-T002
- T007 and T008 can run in parallel in US1
- T013 and T014 can run in parallel in US3

---

## Parallel Example: User Story 1

```bash
Task: "Update list page in src/app/(dashboard)/categories/page.tsx"
Task: "Add detail links in src/components/categories/category-list-table.tsx"
```

---

## Parallel Example: User Story 2

```bash
Task: "Refactor CategoryForm in src/components/categories/category-form.tsx"
Task: "Create page in src/app/(dashboard)/categories/create/page.tsx"
```

---

## Parallel Example: User Story 3

```bash
Task: "Create edit page in src/app/(dashboard)/categories/[id]/edit/page.tsx"
Task: "Add delete modal in src/components/categories/category-delete-modal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate category list and detail pages

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 -> Validate
3. User Story 2 -> Validate
4. User Story 3 -> Validate
5. Polish

---

## Notes

- [P] tasks = different files, no dependencies
- Each user story should be independently testable
- Add tests only if required during implementation
