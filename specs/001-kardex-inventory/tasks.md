---

description: "Task list for Sistema Kardex NIIF"
---

# Tasks: Sistema Kardex NIIF

**Input**: Design documents from `/specs/001-kardex-inventory/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED for critical accounting logic and OPTIONAL otherwise unless requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify repo dependencies and toolchain in package.json
- [x] T002 [P] Align ESLint/TypeScript strictness in tsconfig.json and eslint.config.mjs
- [x] T003 [P] Create base folder structure in src/lib/actions, src/lib/queries, src/lib/validations, src/lib/auth, src/lib/dal, src/lib/db/schema, src/lib/db/migrations

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Setup Drizzle schema bootstrap in src/lib/db/schema/index.ts
- [x] T005 [P] Configure database client in src/lib/db/index.ts
- [x] T006 [P] Define RBAC roles and permissions in src/lib/auth/roles.ts
- [x] T007 [P] Implement auth helpers and session checks in src/lib/auth/guards.ts
- [x] T008 [P] Add Zod base validators in src/lib/validations/common.ts
- [x] T009 Create audit logging utility in src/lib/dal/services/audit-log.service.ts
- [x] T010 Create inventory valuation service in src/lib/dal/services/inventory-valuation.service.ts
- [x] T011 Configure DAL repository interfaces in src/lib/dal/repositories/index.ts
- [x] T012 Add error mapping utilities in src/lib/queries/error-mapper.ts
- [x] T013 Create shared constants for movement states in src/lib/dal/constants/movement-status.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Registrar movimientos con valorizacion (Priority: P1) ?? MVP

**Goal**: Registro de entradas, salidas, transferencias y ajustes con validaciones y flujo de estados

**Independent Test**: Registrar entrada, salida y transferencia con calculo de costo promedio y trazabilidad

### Tests for User Story 1 (REQUIRED for critical accounting logic)

- [x] T014 [P] [US1] Unit test for promedio ponderado in tests/unit/inventory-valuation.test.ts
- [x] T015 [P] [US1] Integration test for publicar movimiento in tests/integration/movements-publish.test.ts

### Implementation for User Story 1

- [x] T016 [P] [US1] Add movimiento schema in src/lib/db/schema/movimientos.ts
- [x] T017 [P] [US1] Add detalle movimiento schema in src/lib/db/schema/detalle-movimientos.ts
- [x] T018 [P] [US1] Add item-bodega schema in src/lib/db/schema/item-bodegas.ts
- [x] T019 [US1] Implement MovimientoRepository in src/lib/dal/repositories/movimientos.repository.ts
- [x] T020 [US1] Implement ItemBodegaRepository in src/lib/dal/repositories/item-bodegas.repository.ts
- [x] T021 [US1] Implement movement validators in src/lib/validations/movements.ts
- [x] T022 [US1] Implement publish/cancel services in src/lib/dal/services/movements.service.ts
- [x] T023 [US1] Implement Server Actions in src/lib/actions/movements.ts
- [x] T024 [US1] Implement query handlers in src/lib/queries/movements.ts
- [x] T025 [US1] Create UI pages in src/app/(dashboard)/movements/page.tsx

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - Consultar dashboard e indicadores (Priority: P2)

**Goal**: Dashboard con existencias, valorizacion, alertas y ultimos movimientos

**Independent Test**: Dashboard refleja stock critico y ultimos movimientos

### Implementation for User Story 2

- [x] T026 [P] [US2] Implement dashboard query in src/lib/queries/dashboard.ts
- [x] T027 [US2] Implement dashboard Server Action in src/lib/actions/dashboard.ts
- [x] T028 [US2] Create dashboard page in src/app/(dashboard)/dashboard/page.tsx
- [x] T029 [US2] Add dashboard components in src/components/dashboard/summary-cards.tsx

**Checkpoint**: Dashboard visible and consistent with inventory data

---

## Phase 5: User Story 3 - Gestionar maestros de datos (Priority: P2)

**Goal**: CRUD de items, bodegas y terceros con validaciones

**Independent Test**: Crear item, bodega y tercero y verlos listados

### Implementation for User Story 3

- [x] T030 [P] [US3] Add item schema in src/lib/db/schema/items.ts
- [x] T031 [P] [US3] Add bodega schema in src/lib/db/schema/bodegas.ts
- [x] T032 [P] [US3] Add tercero schema in src/lib/db/schema/terceros.ts
- [x] T033 [US3] Implement repositories in src/lib/dal/repositories/items.repository.ts
- [x] T034 [US3] Implement repositories in src/lib/dal/repositories/bodegas.repository.ts
- [x] T035 [US3] Implement repositories in src/lib/dal/repositories/terceros.repository.ts
- [x] T036 [US3] Implement validations in src/lib/validations/masters.ts
- [x] T037 [US3] Implement actions in src/lib/actions/masters.ts
- [x] T038 [US3] Implement queries in src/lib/queries/masters.ts
- [x] T039 [US3] Create UI pages in src/app/(dashboard)/items/page.tsx
- [x] T040 [US3] Create UI pages in src/app/(dashboard)/warehouses/page.tsx
- [x] T041 [US3] Create UI pages in src/app/(dashboard)/third-parties/page.tsx

**Checkpoint**: Masters CRUD usable by Admin and read-only for Bodeguero

---

## Phase 6: User Story 4 - Reportes Kardex y exportacion (Priority: P3)

**Goal**: Reportes por item con filtros y exportacion CSV

**Independent Test**: Generar reporte por rango de fechas y exportar CSV

### Implementation for User Story 4

- [x] T042 [P] [US4] Implement kardex query in src/lib/queries/kardex.ts
- [x] T043 [US4] Implement export action in src/lib/actions/kardex-export.ts
- [x] T044 [US4] Create UI page in src/app/(dashboard)/kardex/page.tsx
- [x] T045 [US4] Add CSV formatter in src/lib/queries/csv.ts

**Checkpoint**: Kardex report and export available

---

## Phase 7: User Story 5 - Gestionar usuarios y roles (Priority: P3)

**Goal**: Administracion de usuarios con roles Admin/Bodeguero

**Independent Test**: Crear usuario Bodeguero y validar permisos

### Implementation for User Story 5

- [x] T046 [P] [US5] Add usuario schema in src/lib/db/schema/usuarios.ts
- [x] T047 [P] [US5] Add rol schema in src/lib/db/schema/roles.ts
- [x] T048 [US5] Implement user repository in src/lib/dal/repositories/usuarios.repository.ts
- [x] T049 [US5] Implement user actions in src/lib/actions/users.ts
- [x] T050 [US5] Implement user queries in src/lib/queries/users.ts
- [x] T051 [US5] Create UI pages in src/app/(dashboard)/settings/users/page.tsx

**Checkpoint**: Admin can manage users and roles

---

## Phase 8: User Story 6 - Importar catalogos (Priority: P3)

**Goal**: Importacion de items desde CSV y exportacion de catalogos

**Independent Test**: Importar CSV valido y exportar catalogo

### Implementation for User Story 6

- [x] T052 [P] [US6] Implement CSV import validator in src/lib/validations/imports.ts
- [x] T053 [US6] Implement import action in src/lib/actions/imports.ts
- [x] T054 [US6] Implement export catalog action in src/lib/actions/catalog-export.ts
- [x] T055 [US6] Create UI page in src/app/(dashboard)/items/import/page.tsx
- [x] T056 [US6] Add import template generator in src/lib/queries/import-template.ts

**Checkpoint**: Admin can import/export item catalogs

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T057 [P] Add audit log UI in src/app/(dashboard)/settings/audit-log/page.tsx
- [x] T058 [P] Add MinIO upload helper in src/lib/actions/uploads.ts
- [x] T059 [P] Add Resend email helpers in src/lib/actions/email.ts
- [x] T060 Run quickstart.md validation in specs/001-kardex-inventory/quickstart.md
- [x] T061 [P] Documentation updates in README.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel or in priority order
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2)
- **User Story 4 (P3)**: Can start after Foundational (Phase 2)
- **User Story 5 (P3)**: Can start after Foundational (Phase 2)
- **User Story 6 (P3)**: Can start after Foundational (Phase 2)

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before repositories/services
- Repositories/services before actions/queries
- Actions/queries before UI

### Parallel Opportunities

- Setup tasks T002-T003 can run in parallel
- Foundational tasks T005-T008, T010-T013 can run in parallel
- US1 schemas T016-T018 can run in parallel
- US3 schemas T030-T032 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Unit test for promedio ponderado in tests/unit/inventory-valuation.test.ts"
Task: "Integration test for publicar movimiento in tests/integration/movements-publish.test.ts"
Task: "Add movimiento schema in src/lib/db/schema/movimientos.ts"
Task: "Add detalle movimiento schema in src/lib/db/schema/detalle-movimientos.ts"
Task: "Add item-bodega schema in src/lib/db/schema/item-bodegas.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Test independently -> Deploy/Demo
4. Add User Story 3 -> Test independently -> Deploy/Demo
5. Add User Story 4 -> Test independently -> Deploy/Demo
6. Add User Story 5 -> Test independently -> Deploy/Demo
7. Add User Story 6 -> Test independently -> Deploy/Demo

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
