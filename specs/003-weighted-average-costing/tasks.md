# Tasks: Método de Valoración Promedio Ponderado

**Input**: Design documents from `/specs/003-weighted-average-costing/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/kardex-api.yaml

**Tests**: Not explicitly requested - test tasks omitted. Manual verification via quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, database migrations, and schema changes

- [x] T001 Add `subTipo` field to movimientos schema in `src/lib/drizzle/schemas/movimientos.ts`
- [x] T002 [P] Create audit table schema `auditoria_costo_promedio` in `src/lib/drizzle/schemas/auditoria-costo-promedio.ts`
- [x] T003 [P] Create Kardex types definition in `src/lib/types/kardex.ts`
- [x] T004 Generate and run database migration for `sub_tipo` column in `src/lib/drizzle/migrations/0006_add_subtipo_movimientos.sql`
- [x] T005 Generate and run database migration for `auditoria_costo_promedio` table in `src/lib/drizzle/migrations/0007_create_auditoria_costo_promedio.sql`
- [x] T006 Export new schemas in `src/lib/drizzle/schema.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core weighted average calculation service and repository methods

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create audit repository in `src/lib/dal/repositories/auditoria-costo.repository.ts`
- [x] T008 Add `actualizarCostoPromedio()` method to `src/lib/dal/repositories/item-bodegas.repository.ts`
- [x] T009 Create weighted average service in `src/lib/dal/services/weighted-average.service.ts` with core formula
- [x] T010 Create Zod validators for Kardex queries in `src/lib/validators/kardex.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Registrar Entrada con Recálculo de Promedio (Priority: P1) 🎯 MVP

**Goal**: Recalculate weighted average cost when publishing purchase entries

**Independent Test**: Create entry with 60 units @ $510.00 on existing 120 units @ $500.00, verify new average is $503.33

### Implementation for User Story 1

- [x] T011 [US1] Modify `publicarMovimiento()` in `src/lib/dal/services/movements.service.ts` to detect entrada-compra
- [x] T012 [US1] Integrate weighted average calculation into publication flow in `src/lib/dal/services/movements.service.ts`
- [x] T013 [US1] Add audit logging on cost change in `src/lib/dal/services/movements.service.ts`
- [x] T014 [US1] Handle edge case: first entry with no prior stock in `src/lib/dal/services/weighted-average.service.ts`

**Checkpoint**: Entries with recalculation work. Can verify with quickstart.md Scenario 1-2.

---

## Phase 4: User Story 2 - Registrar Salida al Costo Promedio Actual (Priority: P1)

**Goal**: Exits use current average cost without recalculation, with stock validation

**Independent Test**: Create exit of 70 units when average is $499.23, verify value is $34,946.10 and average unchanged

### Implementation for User Story 2

- [x] T015 [US2] Add stock validation before publishing salida in `src/lib/dal/services/movements.service.ts`
- [x] T016 [US2] Apply current average cost to salida detail lines in `src/lib/dal/services/movements.service.ts`
- [x] T017 [US2] Add "Stock insuficiente" error message with available quantity

**Checkpoint**: Exits with validation work. Can verify with quickstart.md Scenario 3, 7.

---

## Phase 5: User Story 3 - Registrar Devolución en Venta (Priority: P2)

**Goal**: Customer returns entry at current average cost (no recalculation)

**Independent Test**: Return 10 units when average is $499.23, stock increases, average unchanged

### Implementation for User Story 3

- [x] T018 [US3] Handle entrada-devolucion_venta subtype in `src/lib/dal/services/movements.service.ts`
- [x] T019 [US3] Apply current average cost (no recalculation) for devolucion_venta

**Checkpoint**: Customer returns work. Can verify with quickstart.md Scenario 4.

---

## Phase 6: User Story 4 - Registrar Devolución en Compra (Priority: P2)

**Goal**: Supplier returns exit at current average cost (no recalculation)

**Independent Test**: Return 15 units to supplier when average is $502.69, verify stock decreases and average unchanged

### Implementation for User Story 4

- [x] T020 [US4] Handle salida-devolucion_compra subtype in `src/lib/dal/services/movements.service.ts`
- [x] T021 [US4] Add stock validation for devolucion_compra (same as venta)

**Checkpoint**: Supplier returns work. Can verify with quickstart.md data table row 7.

---

## Phase 7: User Story 5 - Consultar Kárdex con Histórico de Costos (Priority: P2)

**Goal**: Display movement history in Kardex card format with filters and pagination

**Independent Test**: Query Kardex for an item and verify 12 columns (Entries, Exits, Existence)

### Implementation for User Story 5

- [x] T022 [P] [US5] Create Kardex data queries in `src/lib/data/kardex.ts`
- [x] T023 [P] [US5] Create API route GET `/api/kardex` in `src/app/api/kardex/route.ts`
- [x] T024 [US5] Implement running totals calculation (existencias) in `src/lib/data/kardex.ts`
- [x] T025 [P] [US5] Create Kardex table component in `src/components/kardex/kardex-table.tsx`
- [x] T026 [P] [US5] Create Kardex filters component in `src/components/kardex/kardex-filters.tsx`
- [x] T027 [P] [US5] Create Kardex empty state component in `src/components/kardex/kardex-empty-state.tsx`
- [x] T028 [US5] Create URL filter hook in `src/hooks/kardex/use-kardex-filters.ts`
- [x] T029 [US5] Update Kardex page to use new components in `src/app/(dashboard)/kardex/page.tsx`

**Checkpoint**: Kardex view works with filters and pagination. Can verify with quickstart.md Scenario 5.

---

## Phase 8: User Story 5 (cont.) - Exportar CSV y Auditoría

**Goal**: CSV export and audit log viewing

### Implementation for CSV Export and Audit

- [x] T030 [P] [US5] Create CSV export endpoint in `src/app/api/kardex/export/route.ts`
- [x] T031 [P] [US5] Create audit endpoint GET `/api/kardex/auditoria` in `src/app/api/kardex/auditoria/route.ts`
- [x] T032 [US5] Add export button to Kardex page in `src/app/(dashboard)/kardex/page.tsx`
- [x] T033 [US5] Add audit history section or modal to Kardex page

**Checkpoint**: CSV export and audit viewing work. Can verify with quickstart.md Scenario 6.

---

## Phase 9: User Story 6 - Transferencia entre Bodegas (Priority: P3)

**Goal**: Transfers use origin cost as entry cost in destination, destination recalculates

**Independent Test**: Transfer 50 units from Bodega A ($100 avg) to Bodega B ($120 avg), verify B recalculates

### Implementation for User Story 6

- [x] T034 [US6] Handle transferencia type in `src/lib/dal/services/movements.service.ts`
- [x] T035 [US6] Exit from origin at current average (no recalculation)
- [x] T036 [US6] Entry to destination at origin's cost (recalculates destination average)
- [x] T037 [US6] Validate origin and destination are different bodegas

**Checkpoint**: Transfers work correctly. Transfer value remains constant across system.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T038 [P] Add `movements:read` permission check to all Kardex API routes
- [x] T039 [P] Add `movements:write` permission check to movement publication
- [ ] T040 Run quickstart.md validation scenarios and verify all calculations match reference data
- [ ] T041 Backfill existing movements with appropriate `sub_tipo` values (migration script)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories 1-2 (Phase 3-4)**: Depend on Foundational - P1 priority, can run sequentially
- **User Stories 3-5 (Phase 5-8)**: Depend on Foundational - P2 priority
- **User Story 6 (Phase 9)**: Depends on Foundational - P3 priority
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - MVP for entries with recalculation
- **User Story 2 (P1)**: Foundation only - MVP for exits with validation
- **User Story 3 (P2)**: Foundation only - Customer returns (independent)
- **User Story 4 (P2)**: Foundation only - Supplier returns (independent)
- **User Story 5 (P2)**: Foundation only - Kardex view (independent of movement logic)
- **User Story 6 (P3)**: Foundation only - Transfers (most complex)

### Parallel Opportunities

**Within Phase 1 (Setup)**:
```
T002 (audit schema) || T003 (types) can run in parallel
T004, T005 migrations run sequentially
```

**Within Phase 7 (Kardex View)**:
```
T022 (data queries) || T023 (API route) can start together
T025 (table) || T026 (filters) || T027 (empty state) can run in parallel
```

**Within Phase 8 (Export/Audit)**:
```
T030 (CSV export) || T031 (audit endpoint) can run in parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (schema, migrations)
2. Complete Phase 2: Foundational (service, repository)
3. Complete Phase 3: User Story 1 (entrada-compra recalculation)
4. Complete Phase 4: User Story 2 (salida with validation)
5. **STOP and VALIDATE**: Test with quickstart.md Scenarios 1-3, 7
6. Deploy if ready - core weighted average functionality works

### Incremental Delivery

1. Setup + Foundational → Database and core logic ready
2. Add US1 + US2 → MVP: Purchases recalculate, sales validate stock
3. Add US3 + US4 → Returns work correctly
4. Add US5 → Kardex view with filters, export, audit
5. Add US6 → Transfers between warehouses
6. Polish → Permissions, validation scenarios

### Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1. Setup | T001-T006 | Schema and migrations |
| 2. Foundation | T007-T010 | Core service and validators |
| 3. US1 (P1) | T011-T014 | Entrada-compra recalculation |
| 4. US2 (P1) | T015-T017 | Salida with stock validation |
| 5. US3 (P2) | T018-T019 | Devolución venta |
| 6. US4 (P2) | T020-T021 | Devolución compra |
| 7. US5 (P2) | T022-T029 | Kardex view |
| 8. US5 cont. | T030-T033 | CSV export + audit |
| 9. US6 (P3) | T034-T037 | Transferencias |
| 10. Polish | T038-T041 | Permissions + validation |

**Total Tasks**: 41
