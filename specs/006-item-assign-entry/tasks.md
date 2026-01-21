# Tasks: Movimiento de Entrada Automático al Asignar Items a Bodega

**Input**: Design documents from `/specs/006-item-assign-entry/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests included as per plan.md specification (Vitest 2.1.3)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Web (fullstack monorepo)
- **Source**: `src/` at repository root
- **Tests**: `tests/` at repository root (to be created if needed)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and validation of existing infrastructure

- [x] T001 Verify existing services work correctly: test `createMovement` and `publicarMovimiento` manually in `src/lib/data/movements.ts` and `src/lib/dal/services/movements.service.ts`
- [x] T002 [P] Verify database schema has required fields in `src/lib/drizzle/schemas/item-bodegas.ts` (stockActual, costoPromedio)
- [x] T003 [P] Verify bodega schema has `auto_update_average_cost` field in `src/lib/drizzle/schemas/bodegas.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create Zod validation schema for item assignment with stock/cost in `src/lib/validators/item-bodega.ts`
- [x] T005 [P] Create TypeScript types for AssignItemInput and AssignItemsResponse in `src/lib/types/bodegas.ts`
- [x] T006 Create helper function to check for duplicate item assignments in `src/lib/data/item-bodegas.ts`
- [x] T007 Create helper function to validate bodega is active in `src/lib/data/item-bodegas.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Asignar Item con Stock Inicial (Priority: P1) 🎯 MVP

**Goal**: Cuando se asigna un item con stock > 0, crear automáticamente un movimiento de entrada publicado

**Independent Test**: Asignar un item nuevo a una bodega con stock=15 y costo=72.67, verificar que aparezca el movimiento en el kardex con cantidad=15 y valor total=$1090.05

### Tests for User Story 1

- [ ] T008 [P] [US1] Create unit test for single item assignment with stock in `tests/lib/data/item-bodegas.test.ts`
- [ ] T009 [P] [US1] Create unit test for duplicate item rejection in `tests/lib/data/item-bodegas.test.ts`
- [ ] T010 [P] [US1] Create unit test for weighted average update on assignment in `tests/lib/data/item-bodegas.test.ts`

### Implementation for User Story 1

- [ ] T011 [US1] Extend `assignItemsToBodega` function signature to accept items with stockInicial and costoUnitario in `src/lib/data/item-bodegas.ts`
- [ ] T012 [US1] Add validation for duplicate items before transaction in `src/lib/data/item-bodegas.ts`
- [ ] T013 [US1] Add validation for bodega active status in `src/lib/data/item-bodegas.ts`
- [ ] T014 [US1] Implement Drizzle transaction wrapper for atomic operations in `src/lib/data/item-bodegas.ts`
- [ ] T015 [US1] Create movement (type="entrada") when stockInicial > 0 using existing `createMovement` in `src/lib/data/item-bodegas.ts`
- [ ] T016 [US1] Publish movement automatically using existing `publicarMovimiento` in `src/lib/data/item-bodegas.ts`
- [ ] T017 [US1] Update API endpoint POST handler to accept new input format in `src/app/api/bodegas/[id]/items/route.ts`
- [ ] T018 [US1] Add error response handling for duplicate items in `src/app/api/bodegas/[id]/items/route.ts`
- [ ] T019 [US1] Add error response handling for inactive bodega in `src/app/api/bodegas/[id]/items/route.ts`

**Checkpoint**: User Story 1 complete - single item assignment with automatic movement creation works

---

## Phase 4: User Story 2 - Asignar Múltiples Items Simultáneamente (Priority: P2)

**Goal**: Asignar varios items en una sola operación, creando un único movimiento con múltiples líneas de detalle

**Independent Test**: Asignar 3 items diferentes a una bodega en una sola operación, verificar que se cree un único movimiento con 3 líneas de detalle

### Tests for User Story 2

- [ ] T020 [P] [US2] Create unit test for multiple items assignment in single transaction in `tests/lib/data/item-bodegas.test.ts`
- [ ] T021 [P] [US2] Create unit test for atomic rollback when one item fails validation in `tests/lib/data/item-bodegas.test.ts`
- [ ] T022 [P] [US2] Create unit test for single movement with multiple details in `tests/lib/data/item-bodegas.test.ts`

### Implementation for User Story 2

- [ ] T023 [US2] Modify `assignItemsToBodega` to handle array of items with individual stock/cost in `src/lib/data/item-bodegas.ts`
- [ ] T024 [US2] Implement batch duplicate validation (all items checked before any assignment) in `src/lib/data/item-bodegas.ts`
- [ ] T025 [US2] Create single movement with multiple detalleMovimientos for items with stock > 0 in `src/lib/data/item-bodegas.ts`
- [ ] T026 [US2] Ensure atomic transaction: all-or-nothing for multiple items in `src/lib/data/item-bodegas.ts`
- [ ] T027 [US2] Update API response to include movimientoId when movement created in `src/app/api/bodegas/[id]/items/route.ts`
- [ ] T028 [US2] Add detailed error response listing which items failed validation in `src/app/api/bodegas/[id]/items/route.ts`

**Checkpoint**: User Stories 1 AND 2 work - both single and multiple item assignment functional

---

## Phase 5: User Story 3 - Asignar Item sin Stock Inicial (Priority: P3)

**Goal**: Permitir asignar items con stock=0 sin crear movimiento de entrada

**Independent Test**: Asignar un item con stock=0, verificar que NO aparezca ningún movimiento en el kardex pero el item esté asignado a la bodega

### Tests for User Story 3

- [ ] T029 [P] [US3] Create unit test for assignment with stock=0 (no movement created) in `tests/lib/data/item-bodegas.test.ts`
- [ ] T030 [P] [US3] Create unit test for mixed assignment (some stock>0, some stock=0) in `tests/lib/data/item-bodegas.test.ts`

### Implementation for User Story 3

- [ ] T031 [US3] Add conditional logic to skip movement creation when all items have stock=0 in `src/lib/data/item-bodegas.ts`
- [ ] T032 [US3] Filter items with stock > 0 for movement details, create item_bodegas for all in `src/lib/data/item-bodegas.ts`
- [ ] T033 [US3] Update response to indicate movimientoId=null when no movement created in `src/app/api/bodegas/[id]/items/route.ts`
- [ ] T034 [US3] Add descriptive message in response based on whether movement was created in `src/app/api/bodegas/[id]/items/route.ts`

**Checkpoint**: All user stories complete - full functionality implemented

---

## Phase 6: Edge Cases & Validation

**Purpose**: Handle all edge cases defined in spec

- [ ] T035 [P] Create unit test for negative stock rejection in `tests/lib/data/item-bodegas.test.ts`
- [ ] T036 [P] Create unit test for negative cost rejection in `tests/lib/data/item-bodegas.test.ts`
- [ ] T037 [P] Create unit test for cost=0 with stock>0 (allowed) in `tests/lib/data/item-bodegas.test.ts`
- [ ] T038 Add Zod validation for stock >= 0 and cost >= 0 in `src/lib/validators/item-bodega.ts`
- [ ] T039 Add validation for max 50 items per operation in `src/lib/validators/item-bodega.ts`
- [ ] T040 Handle decimal precision for stock and cost values in `src/lib/data/item-bodegas.ts`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [ ] T041 [P] Run all tests and ensure 100% pass rate with `npm run test`
- [ ] T042 [P] Validate quickstart.md scenarios work correctly
- [ ] T043 Add JSDoc comments to new/modified functions in `src/lib/data/item-bodegas.ts`
- [ ] T044 Verify kardex displays assigned items correctly by manual testing
- [ ] T045 Performance test: assign 50 items simultaneously and verify < 2 seconds completion

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion (builds on US1 implementation)
- **User Story 3 (Phase 5)**: Depends on User Story 2 completion (adds conditional logic)
- **Edge Cases (Phase 6)**: Can start after Foundational, parallel to user stories
- **Polish (Phase 7)**: Depends on all user stories and edge cases complete

### User Story Dependencies

```
Foundational (T004-T007)
       │
       ▼
User Story 1 (T008-T019) ──── Core: single item + movement
       │
       ▼
User Story 2 (T020-T028) ──── Extends: multiple items + atomic transaction
       │
       ▼
User Story 3 (T029-T034) ──── Extends: conditional movement creation
```

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Validation helpers before business logic
- Business logic before API endpoint updates
- Core implementation before error handling

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002 and T003 can run in parallel

**Phase 2 (Foundational)**:
- T004 and T005 can run in parallel

**Phase 3 (US1 Tests)**:
- T008, T009, T010 can all run in parallel

**Phase 4 (US2 Tests)**:
- T020, T021, T022 can all run in parallel

**Phase 5 (US3 Tests)**:
- T029, T030 can run in parallel

**Phase 6 (Edge Cases)**:
- T035, T036, T037 can all run in parallel

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all tests for User Story 1 together:
Task: "Create unit test for single item assignment with stock in tests/lib/data/item-bodegas.test.ts"
Task: "Create unit test for duplicate item rejection in tests/lib/data/item-bodegas.test.ts"
Task: "Create unit test for weighted average update on assignment in tests/lib/data/item-bodegas.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007)
3. Complete Phase 3: User Story 1 (T008-T019)
4. **STOP and VALIDATE**: Test single item assignment with kardex verification
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP!** (solves reported problem)
3. Add User Story 2 → Test independently → Multiple items support
4. Add User Story 3 → Test independently → Zero-stock assignment support
5. Edge Cases + Polish → Production ready

### Estimated Task Breakdown

| Phase | Task Count | Description |
|-------|------------|-------------|
| Setup | 3 | Verify existing infrastructure |
| Foundational | 4 | Create validators and helpers |
| User Story 1 | 12 | Core functionality (MVP) |
| User Story 2 | 9 | Multiple items support |
| User Story 3 | 6 | Zero-stock support |
| Edge Cases | 6 | Validation edge cases |
| Polish | 5 | Final validation |
| **Total** | **45** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story builds on previous but adds independent testable functionality
- User Story 1 alone solves the original reported problem (kardex not showing assigned stock)
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
