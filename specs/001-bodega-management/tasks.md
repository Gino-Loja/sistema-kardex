---

description: "Task list for feature implementation"
---

# Tasks: Gestion de bodegas

**Input**: Design documents from `specs/001-bodega-management/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested for this feature. Add tests only if requirements change.

**Organization**: Tasks grouped by user story to keep each story independently deliverable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal shared scaffolding

- [x] T001 Create shared bodega types in `src/lib/types/bodegas.ts`
- [x] T002 [P] Add barrel export for warehouses components in `src/components/warehouses/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared building blocks for all stories

- [x] T003 Create bodega API validators in `src/lib/validators/bodega.ts`
- [x] T004 [P] Add bodega data access helpers in `src/lib/data/bodegas.ts`
- [x] T005 [P] Add item-bodega assignment helpers in `src/lib/data/item-bodegas.ts`

**Checkpoint**: Foundation ready - user story work can begin

---

## Phase 3: User Story 1 - Crear y editar bodegas (Priority: P1)

**Goal**: Admin puede crear y editar bodegas con validaciones y permisos.

**Independent Test**: Crear una bodega desde UI, editarla y ver cambios en el listado.

### Implementation

- [x] T006 [US1] Implement GET/POST bodegas API in `src/app/api/bodegas/route.ts`
- [x] T007 [US1] Implement GET/PATCH bodega API in `src/app/api/bodegas/[id]/route.ts` (Admin-only for PATCH)
- [x] T008 [US1] Build warehouse form in `src/components/warehouses/warehouse-form.tsx`
- [x] T009 [US1] Add create page in `src/app/(dashboard)/warehouses/create/page.tsx`
- [x] T010 [US1] Add edit page in `src/app/(dashboard)/warehouses/[id]/edit/page.tsx`
- [x] T011 [US1] Add route permissions for create/edit in `src/lib/auth/route-permissions.ts`

**Checkpoint**: US1 complete and usable by Admin

---

## Phase 4: User Story 2 - Ver detalles de bodega (Priority: P2)

**Goal**: Admin y Bodeguero ven detalle de bodega con informacion y items asignados.

**Independent Test**: Abrir detalle desde listado y validar datos basicos y lista de items.

### Implementation

- [x] T012 [US2] Add bodega detail page in `src/app/(dashboard)/warehouses/[id]/page.tsx`
- [x] T013 [P] [US2] Create detail header component in `src/components/warehouses/warehouse-detail-header.tsx`
- [x] T014 [P] [US2] Create items table component in `src/components/warehouses/warehouse-items-table.tsx`
- [x] T015 [US2] Update list page for links/CTA in `src/app/(dashboard)/warehouses/page.tsx`

**Checkpoint**: US2 complete and independently testable

---

## Phase 5: User Story 3 - Asignar items a una bodega (Priority: P3)

**Goal**: Admin/Bodeguero asignan items activos; duplicados se rechazan.

**Independent Test**: Asignar un item activo y confirmar que aparece en el detalle; intentar duplicado y validar error.

### Implementation

- [x] T016 [US3] Implement GET/POST items assignment API in `src/app/api/bodegas/[id]/items/route.ts`
- [x] T017 [US3] Enforce duplicate/inactive rules in `src/lib/data/item-bodegas.ts`
- [x] T018 [US3] Update repository behavior for duplicates in `src/lib/dal/repositories/item-bodegas.repository.ts`
- [x] T019 [US3] Build assignment UI in `src/components/warehouses/warehouse-item-assignment.tsx`
- [x] T020 [US3] Wire assignment UI into detail page in `src/app/(dashboard)/warehouses/[id]/page.tsx`

**Checkpoint**: US3 complete and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UX and documentation refinements

- [x] T021 [P] Add empty/error states in `src/components/warehouses/warehouse-detail-header.tsx`
- [x] T022 [P] Update quickstart validation notes in `specs/001-bodega-management/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: No dependencies after Foundation
- **US2 (P2)**: Can start after Foundation; uses APIs from US1
- **US3 (P3)**: Can start after Foundation; builds on bodega detail context

### Parallel Opportunities

- T002, T004, T005, T013, T014, T021, T022 can run in parallel

---

## Parallel Example: User Story 2

```bash
Task: "Create detail header component in src/components/warehouses/warehouse-detail-header.tsx"
Task: "Create items table component in src/components/warehouses/warehouse-items-table.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup + Foundational
2. Implement US1 (create/edit bodegas)
3. Validate US1 independently

### Incremental Delivery

1. US1 (create/edit) → validate
2. US2 (detail view) → validate
3. US3 (assignment) → validate
4. Polish
