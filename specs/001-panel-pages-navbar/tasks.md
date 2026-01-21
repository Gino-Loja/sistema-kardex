---

description: "Task list for Navegacion completa del panel y mejora del navbar"
---

# Tasks: Navegacion completa del panel y mejora del navbar

**Input**: Design documents from `/specs/001-panel-pages-navbar/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No explicit tests requested in the spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Review existing navigation source-of-truth and role permissions in src/lib/ (confirm inputs for navbar)
- [x] T002 [P] Document expected navigation sections/items mapping in specs/001-panel-pages-navbar/research.md (append if needed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 Define a navigation data shape (sections/items/roles) in src/lib/navigation/types.ts
- [x] T004 [P] Create navigation builder utilities in src/lib/navigation/build-navigation.ts
- [x] T005 [P] Add role filtering helper in src/lib/navigation/filter-by-role.ts
- [x] T006 Wire a single source export for navbar data in src/lib/navigation/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Acceso a todas las paginas del panel (Priority: P1) ?? MVP

**Goal**: Listar todas las paginas del panel en el navbar segun permisos y permitir navegacion directa.

**Independent Test**: Con un rol valido, el navbar muestra todas las paginas permitidas y cada enlace navega correctamente.

### Implementation for User Story 1

- [x] T007 [US1] Integrate navigation data into navbar UI in src/components/navbar/panel-navbar.tsx
- [x] T008 [US1] Ensure all panel routes are included in the navigation list in src/lib/navigation/panel-pages.ts
- [x] T009 [US1] Add empty-state message for usuarios sin paginas en src/components/navbar/panel-navbar.tsx
- [x] T010 [US1] Validate max 2 interactions to reach any page using navbar structure in src/components/navbar/panel-navbar.tsx

**Checkpoint**: User Story 1 is functional and testable

---

## Phase 4: User Story 2 - Identificar ubicacion y jerarquia (Priority: P2)

**Goal**: Mostrar la pagina activa y su seccion para orientar al usuario.

**Independent Test**: La pagina activa se destaca y la seccion correspondiente aparece visible.

### Implementation for User Story 2

- [x] T011 [US2] Add active route highlighting styles in src/components/navbar/panel-navbar.tsx
- [x] T012 [US2] Ensure section context visibility in src/components/navbar/panel-navbar.tsx
- [x] T013 [US2] Update navigation item metadata for section context in src/lib/navigation/panel-pages.ts

**Checkpoint**: User Story 2 is functional and testable

---

## Phase 5: User Story 3 - Uso en pantallas pequenas (Priority: P3)

**Goal**: Mantener acceso completo con secciones colapsables y scroll interno en pantallas pequenas.

**Independent Test**: En viewport pequeno, todas las paginas siguen accesibles via navbar con secciones colapsables.

### Implementation for User Story 3

- [x] T014 [US3] Implement collapsible sections with internal scroll in src/components/navbar/panel-navbar.tsx
- [x] T015 [US3] Add responsive styles for small screens in src/components/navbar/panel-navbar.module.css
- [x] T016 [US3] Ensure collapsible state handles overflow gracefully in src/components/navbar/panel-navbar.tsx

**Checkpoint**: User Story 3 is functional and testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T017 [P] Update quickstart validation steps in specs/001-panel-pages-navbar/quickstart.md
- [ ] T018 [P] Run manual verification checklist in specs/001-panel-pages-navbar/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)

### Parallel Opportunities

- T004 and T005 can run in parallel after T003
- T007 and T008 can run in parallel (different files) once T006 is complete
- T011 and T013 can run in parallel (different files)
- T014 and T015 can run in parallel

---

## Parallel Example: User Story 1

```text
- [ ] T007 [US1] Integrate navigation data into navbar UI in src/components/navbar/panel-navbar.tsx
- [ ] T008 [US1] Ensure all panel routes are included in the navigation list in src/lib/navigation/panel-pages.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 using quickstart.md

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 -> validate
3. User Story 2 -> validate
4. User Story 3 -> validate

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid vague tasks and ensure each task references a concrete file path
