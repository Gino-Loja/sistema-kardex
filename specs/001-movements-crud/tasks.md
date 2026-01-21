# Tasks: Gestión de Movimientos de Inventario (CRUD)

**Input**: Design documents from `/specs/001-movements-crud/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested - manual browser testing per plan.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Next.js App Router (monolith)
- **Base paths**: `src/app/`, `src/components/`, `src/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create base files and validation schemas needed by all user stories

- [ ] T001 Create Zod validation schemas for movements in src/lib/validators/movement.ts
- [ ] T002 [P] Create data access layer functions in src/lib/data/movements.ts
- [ ] T003 [P] Create search params configuration in src/app/(dashboard)/movements/search-params.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API routes that MUST be complete before ANY user story UI can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create GET /api/movements route for listing with pagination and filters in src/app/api/movements/route.ts
- [ ] T005 Add POST /api/movements handler for creating movements in src/app/api/movements/route.ts
- [ ] T006 Create GET /api/movements/[id] route for fetching single movement in src/app/api/movements/[id]/route.ts
- [ ] T007 Add PATCH /api/movements/[id] handler for updating movements in src/app/api/movements/[id]/route.ts
- [ ] T008 Add DELETE /api/movements/[id] handler for deleting movements in src/app/api/movements/[id]/route.ts

**Checkpoint**: API layer complete - UI implementation can now begin

---

## Phase 3: User Story 1 - Crear Movimiento de Entrada (Priority: P1) 🎯 MVP

**Goal**: Permitir crear movimientos de entrada al inventario con múltiples líneas de ítems

**Independent Test**: Navegar a /movements/create, seleccionar tipo "Entrada", agregar ítems con cantidad y costo, seleccionar bodega destino, guardar y verificar que aparece en el listado

### Implementation for User Story 1

- [ ] T009 [US1] Create MovementForm component with dynamic line items in src/components/movements/movement-form.tsx
- [ ] T010 [US1] Implement conditional bodega field visibility based on tipo in src/components/movements/movement-form.tsx
- [ ] T011 [US1] Add real-time total calculation (cantidad × costoUnitario) in src/components/movements/movement-form.tsx
- [ ] T012 [US1] Create create page rendering MovementForm with mode="create" in src/app/(dashboard)/movements/create/page.tsx
- [ ] T013 [US1] Create MovementListTable component in src/components/movements/movement-list-table.tsx
- [ ] T014 [US1] Update movements list page with table and "Nuevo Movimiento" button in src/app/(dashboard)/movements/page.tsx

**Checkpoint**: At this point, users can create entrada movements and see them in the list

---

## Phase 4: User Story 2 - Crear Movimiento de Salida (Priority: P1)

**Goal**: Permitir crear movimientos de salida del inventario con validación de stock

**Independent Test**: Navegar a /movements/create, seleccionar tipo "Salida", verificar que solo aparece bodega origen, agregar ítem y guardar

### Implementation for User Story 2

- [ ] T015 [US2] Add stock validation for salida type in src/app/api/movements/route.ts (POST handler)
- [ ] T016 [US2] Display stock validation error messages in MovementForm in src/components/movements/movement-form.tsx
- [ ] T017 [US2] Verify conditional field logic shows only bodegaOrigen for salida in src/components/movements/movement-form.tsx

**Checkpoint**: At this point, users can create salida movements with stock validation

---

## Phase 5: User Story 3 - Crear Movimiento de Transferencia (Priority: P2)

**Goal**: Permitir transferir productos entre bodegas con validación de bodegas diferentes

**Independent Test**: Navegar a /movements/create, seleccionar tipo "Transferencia", verificar que aparecen ambas bodegas, intentar guardar con misma bodega origen/destino y verificar error

### Implementation for User Story 3

- [ ] T018 [US3] Add validation for different origin/destination bodegas in src/lib/validators/movement.ts
- [ ] T019 [US3] Add stock validation for transferencia type in src/app/api/movements/route.ts (POST handler)
- [ ] T020 [US3] Verify conditional field logic shows both bodegas for transferencia in src/components/movements/movement-form.tsx

**Checkpoint**: At this point, users can create all three movement types (entrada, salida, transferencia)

---

## Phase 6: User Story 4 - Editar Movimiento Existente (Priority: P2)

**Goal**: Permitir modificar movimientos en estado borrador

**Independent Test**: Navegar a /movements/[id]/edit para un movimiento borrador, modificar cantidad, guardar y verificar cambios. Intentar editar movimiento publicado y verificar bloqueo.

### Implementation for User Story 4

- [ ] T021 [US4] Create detail page displaying movement info read-only in src/app/(dashboard)/movements/[id]/page.tsx
- [ ] T022 [US4] Add Edit button that links to edit page (only for borrador state) in src/app/(dashboard)/movements/[id]/page.tsx
- [ ] T023 [US4] Create edit page with MovementForm mode="edit" in src/app/(dashboard)/movements/[id]/edit/page.tsx
- [ ] T024 [US4] Block edit page access if movement estado !== "borrador" in src/app/(dashboard)/movements/[id]/edit/page.tsx
- [ ] T025 [US4] Add action menu with Edit option to MovementListTable in src/components/movements/movement-list-table.tsx

**Checkpoint**: At this point, users can view details and edit borrador movements

---

## Phase 7: User Story 5 - Eliminar Movimiento (Priority: P3)

**Goal**: Permitir eliminar movimientos en estado borrador con confirmación

**Independent Test**: Desde la página de detalle de un movimiento borrador, hacer clic en eliminar, confirmar en modal y verificar que desaparece del listado

### Implementation for User Story 5

- [ ] T026 [US5] Create MovementDeleteModal component with confirmation in src/components/movements/movement-delete-modal.tsx
- [ ] T027 [US5] Add Delete button to detail page (only for borrador state) in src/app/(dashboard)/movements/[id]/page.tsx
- [ ] T028 [US5] Integrate delete modal with API call in src/app/(dashboard)/movements/[id]/page.tsx
- [ ] T029 [US5] Add Delete option to action menu in MovementListTable in src/components/movements/movement-list-table.tsx

**Checkpoint**: At this point, all CRUD operations are complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Filters, UX improvements, and final validation

- [ ] T030 [P] Create MovementFilters component (tipo, estado, fecha range) in src/components/movements/movement-filters.tsx
- [ ] T031 Integrate filters with list page and API in src/app/(dashboard)/movements/page.tsx
- [ ] T032 Add pagination controls to list page in src/app/(dashboard)/movements/page.tsx
- [ ] T033 [P] Add loading states and error handling to all pages
- [ ] T034 Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 & US2 share P1 priority - can run in parallel after T014
  - US3 depends on US1/US2 completion (builds on form)
  - US4 depends on US1 (needs list and form)
  - US5 depends on US4 (needs detail page)
- **Polish (Phase 8)**: Can start after US1 is complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (API)
    ↓
┌───────────────────────────┐
│  Phase 3: US1 (Entrada)   │ ←── MVP
│  Phase 4: US2 (Salida)    │ ←── Can run parallel with US1
└───────────────────────────┘
    ↓
Phase 5: US3 (Transferencia) ←── Extends form with dual bodega
    ↓
Phase 6: US4 (Editar) ←── Needs detail page, edit page
    ↓
Phase 7: US5 (Eliminar) ←── Needs detail page, modal
    ↓
Phase 8: Polish
```

### Within Each User Story

- API must be complete before UI
- Components before pages
- Core implementation before integration

### Parallel Opportunities

- T002 & T003 can run in parallel (different files)
- T013 & T014 can run in parallel after T012
- T030 can run in parallel with US5 tasks
- Different user stories can be worked on by different developers after Foundational

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all setup tasks together:
Task: "Create Zod validation schemas in src/lib/validators/movement.ts"
Task: "Create data access layer in src/lib/data/movements.ts"
Task: "Create search params in src/app/(dashboard)/movements/search-params.ts"
```

## Parallel Example: User Story 1

```bash
# After form is created (T009-T011), run in parallel:
Task: "Create create page in src/app/(dashboard)/movements/create/page.tsx"
Task: "Create MovementListTable in src/components/movements/movement-list-table.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational API (T004-T008)
3. Complete Phase 3: User Story 1 - Entrada (T009-T014)
4. **STOP and VALIDATE**: Test creating entrada movements
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → API ready
2. Add US1 (Entrada) → Test → Deploy MVP!
3. Add US2 (Salida) → Test → Deploy
4. Add US3 (Transferencia) → Test → Deploy
5. Add US4 (Editar) → Test → Deploy
6. Add US5 (Eliminar) → Test → Deploy
7. Add Polish → Final release

### Task Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1 | T001-T003 | Setup (3 tasks) |
| Phase 2 | T004-T008 | Foundational API (5 tasks) |
| Phase 3 | T009-T014 | US1 - Entrada MVP (6 tasks) |
| Phase 4 | T015-T017 | US2 - Salida (3 tasks) |
| Phase 5 | T018-T020 | US3 - Transferencia (3 tasks) |
| Phase 6 | T021-T025 | US4 - Editar (5 tasks) |
| Phase 7 | T026-T029 | US5 - Eliminar (4 tasks) |
| Phase 8 | T030-T034 | Polish (5 tasks) |
| **Total** | **34 tasks** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US1 + US2 together = complete basic movements (MVP+)
- US3 adds transfers
- US4 + US5 complete full CRUD
