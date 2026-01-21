---

description: "Task list for Item nombre y categoria opcional"
---

# Tasks: Item nombre y categoria opcional

**Input**: Design documents from `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-item-category\`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Includes exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create migration stub at C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\drizzle\migrations\0003_items_categorias.sql

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Define SQL in C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\drizzle\migrations\0003_items_categorias.sql to add categorias table, add items.nombre, add items.categoria_id nullable FK, and enforce unique categoria nombre
- [x] T003 Update item schema in C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\drizzle\schemas\items.ts to add nombre and categoriaId fields and remove the old categoria text field
- [x] T004 Create categoria schema in C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\drizzle\schemas\categorias.ts and export it from C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\drizzle\schema.ts
- [x] T005 Create repository in C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\dal\repositories\categorias.repository.ts with list/create/update/delete and delete clearing item categoriaId
- [x] T006 Create data access in C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\data\categorias.ts for list/get/create/update/delete
- [x] T007 Update validations in C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\validations\masters.ts for categoria create/update and item schemas to use nombre and categoriaId
- [x] T008 Update validators in C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\validators\item.ts and add C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\validators\categoria.ts for category endpoints
- [x] T009 Update types in C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\types\items.ts and add C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\types\categorias.ts for UI typing

---

## Phase 3: User Story 1 - Crear item con nombre y categoria opcional (Priority: P1)

**Goal**: Permitir crear items con nombre obligatorio y categoria opcional.

**Independent Test**: Crear un item con nombre y con/sin categoria desde la UI y verlo en la lista.

### Implementation for User Story 1

- [x] T010 [US1] Update item form UI in C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\items\item-form.tsx to include nombre field and category select loaded from /api/categories
- [x] T011 [P] [US1] Update item create endpoint in C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\api\items\route.ts to accept nombre and categoriaId
- [x] T012 [P] [US1] Update item list UI and search in C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\items\item-list-table.tsx and C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\data\items.ts to display nombre and include it in search

**Checkpoint**: User Story 1 can be tested independently after T010-T012.

---

## Phase 4: User Story 2 - Crear categorias disponibles para items (Priority: P2)

**Goal**: Permitir crear y listar categorias para clasificar items.

**Independent Test**: Crear una categoria y verla en la lista y en el selector de items.

### Implementation for User Story 2

- [x] T013 [US2] Implement categories list/create API in C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\api\categories\route.ts
- [x] T014 [P] [US2] Implement categories get/update/delete API in C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\api\categories\[id]\route.ts with delete clearing item categoriaId
- [x] T015 [US2] Create categories UI in C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\(dashboard)\categories\page.tsx with components in C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\categories\category-form.tsx and C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\categories\category-list-table.tsx
- [x] T016 [P] [US2] Add navigation entry in C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\navigation\panel-pages.ts

**Checkpoint**: User Story 2 can be tested independently after T013-T016.

---

## Phase 5: User Story 3 - Cambiar o quitar categoria de un item (Priority: P3)

**Goal**: Permitir editar items para cambiar o quitar su categoria.

**Independent Test**: Editar un item, cambiar su categoria o dejarla vacia, y confirmar el cambio.

### Implementation for User Story 3

- [x] T017 [US3] Update edit page defaults in C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\(dashboard)\items\[id]\edit\page.tsx to use nombre and categoriaId and allow clearing category
- [x] T018 [P] [US3] Update item update endpoint in C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\api\items\[id]\route.ts to accept nombre and categoriaId (nullable)

**Checkpoint**: User Story 3 can be tested independently after T017-T018.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T019 [P] Update quickstart verification notes in C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-item-category\quickstart.md
- [ ] T020 Run quickstart smoke checklist in C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-item-category\quickstart.md and capture any adjustments needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - should integrate with shared categories API
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - depends on item create changes from US1

### Parallel Opportunities

- Phase 2 tasks T003-T009 can be parallelized when touching different files
- User Story 1 tasks T011 and T012 can run in parallel
- User Story 2 tasks T014 and T016 can run in parallel
- User Story 3 task T018 can run in parallel with T017

---

## Parallel Example: User Story 1

```bash
Task: "Update item create endpoint in C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\api\items\route.ts to accept nombre and categoriaId"
Task: "Update item list UI and search in C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\items\item-list-table.tsx and C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\data\items.ts"
```

---

## Parallel Example: User Story 2

```bash
Task: "Implement categories get/update/delete API in C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\api\categories\[id]\route.ts"
Task: "Add navigation entry in C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\navigation\panel-pages.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational
2. Deliver User Story 1, validate independently
3. Deliver User Story 2, validate independently
4. Deliver User Story 3, validate independently
5. Finish Polish tasks

---

## Notes

- [P] tasks = different files, no dependencies
- Each user story should be independently completable and testable
