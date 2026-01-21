# Tasks: Mejoras UX Movimientos - Estado y Costo Automático

**Input**: Design documents from `/specs/004-movement-ux-fixes/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: No se solicitaron tests explícitamente. Tareas de testing omitidas.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Web application (Next.js App Router)
- **Frontend/Backend**: `src/` (fullstack monorepo)
- Components: `src/components/movements/`
- API Routes: `src/app/api/`
- Data layer: `src/lib/data/`, `src/lib/dal/`
- Hooks: `src/hooks/movements/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Componentes compartidos y estructura base para esta feature

- [x] T001 [P] Create MovementStatusBadge component with variants (borrador=gray, publicado=green, anulado=red) in `src/components/movements/movement-status-badge.tsx`
- [x] T002 [P] Create TypeScript types for API responses (PublishMovementResponse, VoidMovementResponse, AverageCostsResponse) in `src/lib/types/movements.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API endpoints y funciones de datos que DEBEN completarse antes de cualquier user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create API route POST `/api/movements/[id]/publish/route.ts` that calls `movements.service.publicarMovimiento()` with proper error handling (409 for non-borrador, 422 for stock insufficient)
- [x] T004 [P] Create API route POST `/api/movements/[id]/void/route.ts` that calls `movements.service.anularMovimiento()` with proper error handling (409 for non-publicado)
- [x] T005 [P] Create API route GET `/api/item-bodegas/average-costs/route.ts` that returns costoPromedio for multiple items in a bodega (batch query)
- [x] T006 Add function `getAverageCosts(bodegaId: string, itemIds: string[])` in `src/lib/data/item-bodegas.ts` using existing repository

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Publicar Movimiento (Priority: P1) 🎯 MVP

**Goal**: Permitir cambiar estado de "Borrador" a "Publicado" desde la vista de detalle

**Independent Test**: Acceder a un movimiento borrador, presionar "Publicar", confirmar que el estado cambia a "Publicado"

### Implementation for User Story 1

- [x] T007 [US1] Create MovementActionButtons component with "Publicar" button (shows only when estado="borrador") in `src/components/movements/movement-action-buttons.tsx`
- [x] T008 [US1] Add confirmation AlertDialog for publish action in MovementActionButtons (pattern from movement-delete-modal.tsx)
- [x] T009 [US1] Integrate MovementActionButtons into movement detail page `src/app/(dashboard)/movements/[id]/page.tsx`
- [x] T010 [US1] Handle publish API call with loading state and success/error toast notifications
- [x] T011 [US1] Update page state after successful publish (refresh movement data)

**Checkpoint**: User Story 1 complete - usuarios pueden publicar movimientos desde la UI

---

## Phase 4: User Story 2 - Anular Movimiento (Priority: P2)

**Goal**: Permitir anular un movimiento publicado desde la vista de detalle

**Independent Test**: Acceder a un movimiento publicado, presionar "Anular", confirmar que el estado cambia a "Anulado"

### Implementation for User Story 2

- [x] T012 [US2] Add "Anular" button to MovementActionButtons (shows only when estado="publicado") in `src/components/movements/movement-action-buttons.tsx`
- [x] T013 [US2] Add confirmation AlertDialog for void action with warning about inventory impact
- [x] T014 [US2] Handle void API call with loading state and success/error toast notifications
- [x] T015 [US2] Update movement detail page to show no action buttons when estado="anulado"

**Checkpoint**: User Story 2 complete - usuarios pueden anular movimientos publicados

---

## Phase 5: User Story 3 - Costo Automático en Salidas (Priority: P1)

**Goal**: Campo de costo unitario auto-calculado y readonly cuando el tipo es "Salida"

**Independent Test**: Crear movimiento de salida, seleccionar ítem, verificar que el costo se llena automáticamente y no es editable

### Implementation for User Story 3

- [x] T016 [P] [US3] Create custom hook `useAverageCost(bodegaId, itemIds)` that fetches costs from API in `src/hooks/movements/use-average-cost.ts`
- [x] T017 [US3] Modify movement-form.tsx to detect when tipo="salida" and disable costoUnitario input field
- [x] T018 [US3] Add logic to fetch and auto-fill costoPromedio when item is selected in salida mode in `src/components/movements/movement-form.tsx`
- [x] T019 [US3] Add visual indicator (icon or text) showing cost is auto-calculated in salida mode
- [x] T020 [US3] Show warning alert when item has costoPromedio=0 (no average cost established) in form

**Checkpoint**: User Story 3 complete - costos en salidas se calculan automáticamente

---

## Phase 6: User Story 4 - Costo Editable en Entradas (Priority: P1)

**Goal**: Campo de costo unitario editable cuando el tipo es "Entrada"

**Independent Test**: Crear movimiento de entrada, verificar que el campo de costo está habilitado para edición

### Implementation for User Story 4

- [x] T021 [US4] Ensure costoUnitario field is enabled and editable when tipo="entrada" in `src/components/movements/movement-form.tsx`
- [x] T022 [US4] Add logic to switch cost field between readonly (salida) and editable (entrada) when tipo changes
- [x] T023 [US4] When changing from entrada→salida with items selected, replace manual costs with costoPromedio values
- [x] T024 [US4] Handle transferencias: use costoPromedio from bodega origen (salida side behavior)

**Checkpoint**: User Story 4 complete - costos en entradas son editables manualmente

---

## Phase 7: User Story 5 - Visualizar Estado (Priority: P2)

**Goal**: Mostrar badges visuales de estado en listado y detalle

**Independent Test**: Ver listado de movimientos, verificar que cada uno muestra badge con color según estado

### Implementation for User Story 5

- [x] T025 [US5] Integrate MovementStatusBadge into movement-list-table.tsx (add estado column with colored badge)
- [x] T026 [US5] Add MovementStatusBadge to movement detail page header in `src/app/(dashboard)/movements/[id]/page.tsx`
- [x] T027 [US5] Ensure badge colors are accessible (sufficient contrast, not color-only differentiation)

**Checkpoint**: User Story 5 complete - estados visibles en toda la UI

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan múltiples user stories

- [x] T028 [P] Add stock validation warning when editing a draft salida/transferencia (FR-013) - show alert if current stock < required quantity in `src/components/movements/movement-form.tsx`
- [x] T029 [P] Update movement-list-table.tsx to show estado in mobile view (responsive)
- [ ] T030 Run quickstart.md validation - test all scenarios documented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phases 3-7 (User Stories)**: All depend on Phase 2 completion
  - US1 (Publicar) and US3 (Costo Auto) can run in parallel (both P1)
  - US2 (Anular) depends on US1 components (extends same buttons)
  - US4 (Costo Editable) depends on US3 (shared form logic)
  - US5 (Visualizar) can run in parallel with others
- **Phase 8 (Polish)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 2 (Foundational)
    │
    ├─► US1 (Publicar) ─────► US2 (Anular)
    │
    ├─► US3 (Costo Auto) ───► US4 (Costo Editable)
    │
    └─► US5 (Visualizar Estado)
```

- **US1 → US2**: US2 extends the action buttons created in US1
- **US3 → US4**: US4 builds on the conditional logic from US3
- **US5**: Independent, only needs MovementStatusBadge from Phase 1

### Within Each User Story

- API endpoints (Phase 2) must exist before UI tasks
- Shared components (Phase 1) must exist before integration
- Core functionality before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T001, T002 can run in parallel (different files)
- **Phase 2**: T003, T004, T005, T006 - T004 and T005 can run in parallel
- **User Stories**: US1+US3+US5 can start in parallel after Phase 2
- **Within US3**: T016 (hook) can run in parallel with other US3 tasks

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Sequential (T003 first as it sets the pattern):
Task: "T003 Create API route POST /api/movements/[id]/publish/route.ts"

# Then in parallel:
Task: "T004 Create API route POST /api/movements/[id]/void/route.ts"
Task: "T005 Create API route GET /api/item-bodegas/average-costs/route.ts"
Task: "T006 Add function getAverageCosts in src/lib/data/item-bodegas.ts"
```

## Parallel Example: After Phase 2

```bash
# Three user stories can start simultaneously:
Task: "T007 [US1] Create MovementActionButtons component"
Task: "T016 [US3] Create custom hook useAverageCost"
Task: "T025 [US5] Integrate MovementStatusBadge into movement-list-table.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 3 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T006)
3. Complete Phase 3: US1 - Publicar (T007-T011)
4. Complete Phase 5: US3 - Costo Auto (T016-T020)
5. **STOP and VALIDATE**: Test publicar + costo automático
6. Deploy/demo if ready - usuarios pueden publicar movimientos y costos se calculan correctamente

### Incremental Delivery

1. **Setup + Foundational** → APIs ready
2. **+ US1 (Publicar)** → MVP para gestión de estados
3. **+ US3 (Costo Auto)** → MVP completo para contabilidad
4. **+ US5 (Visualizar)** → Mejor UX en listados
5. **+ US2 (Anular)** → Flujo completo de estados
6. **+ US4 (Costo Editable)** → Comportamiento diferenciado entrada/salida
7. **+ Polish** → Validaciones adicionales y pulido

### Suggested First Commit

```
T001 + T002 + T003 + T004 + T005 + T006
= Phase 1 + Phase 2 complete
= All APIs functional, ready for UI
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Servicios `publicarMovimiento()` y `anularMovimiento()` ya existen en `movements.service.ts`
- No se requieren cambios a la base de datos
- Usar patrón de `movement-delete-modal.tsx` para modales de confirmación
- Componente `AlertDialog` de `@base-ui/react` para confirmaciones
