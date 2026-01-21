---

description: "Task list for feature implementation"
---

# Tasks: Asignacion de items a bodega

**Input**: Design documents from `specs/001-assign-items/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested for this feature. Add tests only if requirements change.

**Organization**: Tasks grouped by user story to keep each story independently deliverable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal shared scaffolding

- [x] T001 Create assigned-items paging/update types in `src/lib/types/bodegas.ts`
- [x] T002 [P] Add list/update validators for bodega items in `src/lib/validators/bodega.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared building blocks for all stories

- [x] T003 Extend item-bodega repository with update/delete helpers in `src/lib/dal/repositories/item-bodegas.repository.ts`
- [x] T004 [P] Add paginated list and update/delete helpers in `src/lib/data/item-bodegas.ts`

**Checkpoint**: Foundation ready - user story work can begin

---

## Phase 3: User Story 1 - Asignar items con buscador (Priority: P1)

**Goal**: Bodeguero puede abrir un modal con buscador y seleccionar items disponibles.

**Independent Test**: Abrir modal, buscar un item activo, seleccionarlo y confirmar asignacion.

### Implementation

- [x] T005 [P] [US1] Align items search contract params in `specs/001-assign-items/contracts/openapi.yaml`
- [x] T006 [US1] Build modal UI for assignment in `src/components/warehouses/warehouse-item-assignment.tsx`
- [x] T007 [US1] Add search, selection, and disable-assigned logic in `src/components/warehouses/warehouse-item-assignment.tsx`

**Checkpoint**: US1 complete and independently testable

---

## Phase 4: User Story 2 - Gestionar items asignados (Priority: P2)

**Goal**: Ver items asignados con paginacion de 20 y eliminar con confirmacion.

**Independent Test**: Cargar pagina 1/2, eliminar un item y confirmar que desaparece.

### Implementation

- [x] T008 [US2] Add paginated GET response in `src/app/api/bodegas/[id]/items/route.ts`
- [x] T009 [US2] Create DELETE route for assigned items in `src/app/api/bodegas/[id]/items/[itemId]/route.ts`
- [x] T010 [US2] Wire paginated list response in `src/lib/data/item-bodegas.ts`
- [x] T011 [US2] Add delete handler in `src/lib/data/item-bodegas.ts`
- [x] T012 [US2] Convert assigned items table to paginated UI with delete confirm in `src/components/warehouses/warehouse-items-table.tsx`
- [x] T013 [US2] Update detail page to use paginated table API in `src/app/(dashboard)/warehouses/[id]/page.tsx`

**Checkpoint**: US2 complete and independently testable

---

## Phase 5: User Story 3 - Editar stocks y costo en la tabla (Priority: P3)

**Goal**: Editar stock/costo inline y guardar todos los cambios en una sola accion.

**Independent Test**: Editar valores, ver boton de guardar, guardar y ver cambios persistidos.

### Implementation

- [x] T014 [US3] Add PATCH handler for assigned item updates in `src/app/api/bodegas/[id]/items/[itemId]/route.ts`
- [x] T015 [US3] Implement update persistence in `src/lib/data/item-bodegas.ts`
- [x] T016 [US3] Add inline edit fields with change tracking in `src/components/warehouses/warehouse-items-table.tsx`
- [x] T017 [US3] Add save-all action with validation rules in `src/components/warehouses/warehouse-items-table.tsx`
- [x] T018 [US3] Add unsaved-changes confirm on navigation in `src/components/warehouses/warehouse-items-table.tsx`

**Checkpoint**: US3 complete and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UX and documentation refinements

- [x] T019 [P] Update quickstart steps for pagination and save-all flow in `specs/001-assign-items/quickstart.md`
- [x] T020 Run quickstart validation notes in `specs/001-assign-items/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: No dependencies after Foundation
- **US2 (P2)**: No dependencies after Foundation
- **US3 (P3)**: Depends on US2 table refresh flow

### Parallel Opportunities

- T002, T004, T005, T019 can run in parallel with other tasks in their phase

---

## Parallel Example: User Story 1

```bash
Task: "Align items search contract params in specs/001-assign-items/contracts/openapi.yaml"
Task: "Build modal UI for assignment in src/components/warehouses/warehouse-item-assignment.tsx"
```

---

## Parallel Example: User Story 2

```bash
Task: "Add paginated GET response in src/app/api/bodegas/[id]/items/route.ts"
Task: "Create DELETE route for assigned items in src/app/api/bodegas/[id]/items/[itemId]/route.ts"
```

---

## Parallel Example: User Story 3

```bash
Task: "Implement update persistence in src/lib/data/item-bodegas.ts"
Task: "Add inline edit fields with change tracking in src/components/warehouses/warehouse-items-table.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 + Phase 2
2. Implement US1 (modal assignment with search)
3. Validate US1 independently

### Incremental Delivery

1. US1 -> validate
2. US2 -> validate
3. US3 -> validate
4. Polish
