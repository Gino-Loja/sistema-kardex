---

description: "Task list for feature implementation"
---

# Tasks: Vista de detalles de item

**Input**: Design documents from `/specs/001-item-details-view/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Add ItemDetail type for detail fields in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\types\items.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Align `getItemById` output with detail fields (nombre, codigo, categoria, unidad, estado, imagenUrl) in `C:\Users\ginol\Desktop\projects\sistema-kardex\src\lib\data\items.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Ver informacion del item (Priority: P1) MVP

**Goal**: Abrir la vista de detalles desde la lista y ver la informacion principal del item.

**Independent Test**: Desde la lista, hacer clic en el nombre del item y confirmar que se muestra la vista de detalles con los campos definidos.

### Implementation for User Story 1

- [x] T003 [US1] Crear la pagina de detalles en `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\(dashboard)\items\[id]\page.tsx` usando `getItemById` y mostrando nombre, codigo, categoria, unidad y estado
- [x] T004 [P] [US1] Convertir el nombre del item en enlace a `/items/[id]` en `C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\items\item-list-table.tsx`

**Checkpoint**: User Story 1 funcional y validable de forma independiente

---

## Phase 4: User Story 2 - Acciones visibles por item (Priority: P2)

**Goal**: Mostrar acciones eliminar, ver y actualizar en la lista con control por permisos.

**Independent Test**: En la lista, cada item muestra las tres acciones cuando hay permisos; con rol sin permisos se ocultan las acciones restringidas.

### Implementation for User Story 2

- [x] T005 [US2] Derivar permisos de lectura/escritura con `getAuthSession` + `hasPermission` y pasar flags a `ItemListTable` desde `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\(dashboard)\items\page.tsx`
- [x] T006 [US2] Renderizar acciones Ver/Actualizar/Eliminar (con `ItemDeleteModal`) y ocultarlas segun permisos en `C:\Users\ginol\Desktop\projects\sistema-kardex\src\components\items\item-list-table.tsx`

**Checkpoint**: User Story 2 funcional y validable de forma independiente

---

## Phase 5: User Story 3 - Manejo de item inexistente (Priority: P3)

**Goal**: Mostrar mensaje claro con enlace a la lista cuando el item no existe.

**Independent Test**: Abrir `/items/[id]` con un id inexistente y validar el mensaje con enlace a la lista.

### Implementation for User Story 3

- [x] T007 [US3] Renderizar estado "item no encontrado" con enlace a `/items` en `C:\Users\ginol\Desktop\projects\sistema-kardex\src\app\(dashboard)\items\[id]\page.tsx`

**Checkpoint**: User Story 3 funcional y validable de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T008 Validar el flujo end-to-end siguiendo `C:\Users\ginol\Desktop\projects\sistema-kardex\specs\001-item-details-view\quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Depends on US1 to ensure the "Ver" action resolves to a working details page
- **User Story 3 (P3)**: Depends on US1 because it extends the details page behavior

### Within Each User Story

- Data access before UI rendering
- Core UI before permission-based behavior
- Story complete before moving to next priority

### Parallel Opportunities

- [P] task T004 can run in parallel with T003 (different files)

---

## Parallel Example: User Story 1

```bash
Task: "Crear la pagina de detalles en src/app/(dashboard)/items/[id]/page.tsx"
Task: "Convertir el nombre del item en enlace a /items/[id] en src/components/items/item-list-table.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 -> Validate
3. User Story 2 -> Validate
4. User Story 3 -> Validate
5. Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid vague tasks or cross-story dependencies
