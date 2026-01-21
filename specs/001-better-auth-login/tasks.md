---

description: "Task list for Protected Email Login"
---

# Tasks: Protected Email Login

**Input**: Design documents from `/specs/001-better-auth-login/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth.yaml

**Tests**: Not requested for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared auth helpers

- [X] T001 Create public route configuration in `src/lib/auth/routes.ts`
- [X] T002 [P] Add redirect helpers for `next` handling in `src/lib/auth/redirects.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core route protection infrastructure required for all stories

- [X] T003 Implement middleware auth gate and redirect capture in `src/middleware.ts`
- [X] T004 [P] Add server session helper wrapper in `src/lib/auth/session.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Acceso protegido con login (Priority: P1)

**Goal**: Email/password login with password reset flow at `/login`

**Independent Test**: Access a protected route unauthenticated, complete login, and reach the requested route; complete password reset and login with new password.

### Implementation for User Story 1

- [X] T005 [US1] Create `/login` page shell in `src/app/login/page.tsx`
- [X] T006 [P] [US1] Build login form UI in `src/components/auth/login-form.tsx`
- [X] T007 [P] [US1] Build password reset UI in `src/components/auth/password-reset-form.tsx`
- [X] T008 [US1] Wire auth client handlers in `src/components/auth/login-form.tsx` and `src/components/auth/password-reset-form.tsx`
- [X] T009 [US1] Add auth server actions for reset request/confirm in `src/lib/actions/auth.ts`

**Checkpoint**: User Story 1 is functional and testable independently

---

## Phase 4: User Story 2 - Role-based access control (Priority: P2)

**Goal**: Enforce role permissions per route and block unauthorized access

**Independent Test**: Sign in with different roles and verify restricted routes show a forbidden response.

### Implementation for User Story 2

- [X] T010 [US2] Define route-to-permission map in `src/lib/auth/route-permissions.ts`
- [X] T011 [US2] Enforce RBAC checks in `src/middleware.ts` using `src/lib/auth/route-permissions.ts`
- [X] T012 [US2] Add forbidden page in `src/app/forbidden/page.tsx`
- [X] T013 [US2] Filter navigation items by role in `src/lib/navigation/filter-by-role.ts`

**Checkpoint**: User Story 2 is functional and testable independently

---

## Phase 5: User Story 3 - Login page redirect for active sessions (Priority: P3)

**Goal**: Redirect signed-in users away from `/login` to their last requested protected route

**Independent Test**: Visit `/login` while signed in and confirm redirect to the stored `next` route.

### Implementation for User Story 3

- [X] T014 [US3] Add session check and redirect logic in `src/app/login/page.tsx`

**Checkpoint**: User Story 3 is functional and testable independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and validation steps

- [X] T015 [P] Update login and reset usage notes in `README.md`
- [ ] T016 Run quickstart verification steps in `specs/001-better-auth-login/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion and can proceed in priority order
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories
- **User Story 2 (P2)**: Depends on middleware foundation; otherwise independent
- **User Story 3 (P3)**: Depends on middleware foundation and login page shell

### Parallel Opportunities

- **US1**: T006 and T007 can run in parallel (separate components)
- **US2**: T010 and T012 can run in parallel (map and page)
- **Polish**: T015 can run in parallel with T016

---

## Parallel Example: User Story 1

```bash
Task: "Build login form UI in src/components/auth/login-form.tsx"
Task: "Build password reset UI in src/components/auth/password-reset-form.tsx"
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
5. Polish & cross-cutting updates
