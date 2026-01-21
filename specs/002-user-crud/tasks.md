# Tasks: User Management CRUD

**Input**: Design documents from `/specs/002-user-crud/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this feature as they were not explicitly requested in the specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js web application following the App Router pattern:
- **Pages**: `src/app/(dashboard)/settings/users/`
- **API Routes**: `src/app/api/users/`
- **Components**: `src/components/users/`
- **Data Layer**: `src/lib/data/users.ts`
- **Validation**: `src/lib/validators/user.ts`
- **Types**: `src/lib/types/users.ts`
- **Hooks**: `src/hooks/users/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and type definitions that all user stories will use

- [X] T001 [P] Create users directory structure in src/app/(dashboard)/settings/users/
- [X] T002 [P] Create users API directory structure in src/app/api/users/ and src/app/api/users/[id]/
- [X] T003 [P] Create components directory in src/components/users/
- [X] T004 [P] Create data layer file src/lib/data/users.ts
- [X] T005 [P] Create validators directory with src/lib/validators/user.ts
- [X] T006 [P] Create types directory with src/lib/types/users.ts
- [X] T007 [P] Create hooks directory with src/hooks/users/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 [P] Define TypeScript interfaces for User, UserListFilters, UserListResult in src/lib/types/users.ts
- [X] T009 [P] Create Zod validation schemas (userListQuerySchema, userCreateSchema, userUpdateSchema) in src/lib/validators/user.ts
- [X] T010 Create search params parser with usersSearchParams and loadUsersSearchParams in src/app/(dashboard)/settings/users/search-params.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View User List (Priority: P1) 🎯 MVP

**Goal**: Administrators can view a paginated list of all users with search by name and filter by status

**Independent Test**: Navigate to `/settings/users`, verify users are displayed in a table with pagination showing 20 users per page. Test search by name and status filter (active/banned). Verify filters persist across page navigation.

### Implementation for User Story 1

- [X] T011 [P] [US1] Implement listUsers function with pagination and filters in src/lib/data/users.ts
- [X] T012 [P] [US1] Create UserListTable component with table structure and action buttons in src/components/users/user-list-table.tsx
- [X] T013 [P] [US1] Create UserFilters component with search input and status dropdown in src/components/users/user-filters.tsx
- [X] T014 [P] [US1] Implement GET /api/users endpoint with permission check and pagination in src/app/api/users/route.ts
- [X] T015 [US1] Create users list page with filters, table, and pagination controls in src/app/(dashboard)/settings/users/page.tsx (depends on T011-T014)
- [X] T016 [US1] Add "Nuevo usuario" button linking to create page in src/app/(dashboard)/settings/users/page.tsx
- [X] T017 [US1] Implement pagination controls (page numbers, next/previous buttons) with filter persistence
- [X] T018 [US1] Add permission check (users:manage) to page component in src/app/(dashboard)/settings/users/page.tsx
- [ ] T019 [US1] Test list view with 20+ users, verify pagination, search by name, status filtering, and filter persistence

**Checkpoint**: At this point, User Story 1 should be fully functional - administrators can view, search, and filter the user list

---

## Phase 4: User Story 2 - Create New User (Priority: P2)

**Goal**: Administrators can create new user accounts with name, email, password, and role assignment

**Independent Test**: Click "Nuevo usuario" button, fill in create form with name, email, password, and role. Submit and verify user appears in list. Test validation errors for missing fields and duplicate email.

### Implementation for User Story 2

- [X] T020 [P] [US2] Implement createUser function using better-auth API in src/lib/data/users.ts
- [X] T021 [P] [US2] Create UserForm component with name, email, password, role fields and validation in src/components/users/user-form.tsx
- [X] T022 [P] [US2] Implement POST /api/users endpoint with permission check and email uniqueness validation in src/app/api/users/route.ts
- [X] T023 [US2] Create user create page with form and submit handler in src/app/(dashboard)/settings/users/create/page.tsx (depends on T020-T022)
- [X] T024 [US2] Add client-side validation with React Hook Form and Zod in UserForm component
- [X] T025 [US2] Implement success redirect to user list with success message after creation
- [X] T026 [US2] Add error handling for duplicate email ("This email is already registered")
- [X] T027 [US2] Add error handling for validation failures and display field-level errors
- [ ] T028 [US2] Test create flow: successful creation, validation errors, duplicate email error

**Checkpoint**: At this point, User Stories 1 AND 2 both work independently - view list and create new users

---

## Phase 5: User Story 3 - Edit Existing User (Priority: P3)

**Goal**: Administrators can update user information (name, email, role, banned status) with validation

**Independent Test**: From user list, click edit action on a user. Verify form is pre-filled. Modify name, email, or role and submit. Verify changes persist in list. Test ban/unban with ban reason. Verify self-ban prevention and last admin protection.

### Implementation for User Story 3

- [X] T029 [P] [US3] Implement getUserById function in src/lib/data/users.ts
- [X] T030 [P] [US3] Implement updateUser function using better-auth API with validation in src/lib/data/users.ts
- [X] T031 [P] [US3] Implement GET /api/users/[id] endpoint for fetching user details in src/app/api/users/[id]/route.ts
- [X] T032 [P] [US3] Implement PUT /api/users/[id] endpoint with permission check and validation in src/app/api/users/[id]/route.ts
- [X] T033 [US3] Update UserForm component to support edit mode with pre-filled data (reuse from US2)
- [X] T034 [US3] Create user edit page with pre-populated form in src/app/(dashboard)/settings/users/[id]/edit/page.tsx (depends on T029-T032)
- [X] T035 [US3] Add edit action button to UserListTable component linking to edit page
- [X] T036 [US3] Implement self-ban prevention check in PUT endpoint (FR-014a: "Cannot ban your own account")
- [X] T037 [US3] Implement last admin protection check in PUT endpoint (FR-014b: "Cannot remove last administrator")
- [X] T038 [US3] Add banned status toggle and ban reason field to edit form
- [X] T039 [US3] Add error handling for duplicate email (excluding current user's own email)
- [X] T040 [US3] Implement success message and redirect after update
- [ ] T041 [US3] Test edit flow: name/email/role updates, ban/unban, self-ban prevention, last admin protection, duplicate email validation

**Checkpoint**: At this point, User Stories 1, 2, AND 3 all work independently - view, create, and edit users

---

## Phase 6: User Story 4 - Delete User (Priority: P4)

**Goal**: Administrators can permanently delete user accounts with confirmation modal and automatic session termination

**Independent Test**: From user list or edit page, click delete button. Verify confirmation modal appears. Confirm deletion and verify user is removed from list. Test self-deletion prevention. Verify sessions are terminated.

### Implementation for User Story 4

- [X] T042 [P] [US4] Implement deleteUser function using better-auth API in src/lib/data/users.ts
- [X] T043 [P] [US4] Create UserDeleteModal component with confirmation dialog in src/components/users/user-delete-modal.tsx
- [X] T044 [P] [US4] Implement DELETE /api/users/[id] endpoint with permission check in src/app/api/users/[id]/route.ts
- [ ] T045 [US4] Add delete button to UserListTable component with modal trigger (depends on T042-T044)
- [X] T046 [US4] Add delete button to user edit page with modal trigger
- [X] T047 [US4] Implement self-deletion prevention check in DELETE endpoint (FR-014: "Cannot delete your own account")
- [X] T048 [US4] Implement last admin protection check in DELETE endpoint (FR-014b: "Cannot remove last administrator")
- [X] T049 [US4] Add confirmation modal with "Are you sure you want to delete this user?" message
- [X] T050 [US4] Implement cancel action that closes modal without changes
- [X] T051 [US4] Implement success message and redirect to user list after deletion
- [X] T052 [US4] Verify better-auth automatically terminates sessions on user deletion (FR-015)
- [ ] T053 [US4] Test delete flow: successful deletion, self-deletion prevention, last admin protection, session termination, cancel action

**Checkpoint**: All four user stories are now complete and independently functional - full CRUD for user management

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T054 [P] Add responsive design adjustments for mobile/tablet views across all user components
- [ ] T055 [P] Add loading states for async operations (list loading, form submission, deletion)
- [ ] T056 [P] Add proper error boundaries for graceful error handling across user pages
- [ ] T057 [P] Implement toast notifications for success/error messages instead of inline messages
- [ ] T058 [P] Add confirmation before navigating away from unsaved form changes
- [ ] T059 [P] Add accessibility improvements (ARIA labels, keyboard navigation, screen reader support)
- [ ] T060 [P] Optimize table rendering performance for large datasets
- [ ] T061 [P] Add proper input sanitization for search field and special characters
- [ ] T062 [P] Handle edge cases: very long names/emails with text truncation and tooltips
- [ ] T063 [P] Add URL parameter validation for page numbers (prevent negative/invalid values)
- [ ] T064 Validate against quickstart.md checklist - verify all requirements met
- [ ] T065 Perform end-to-end manual testing of complete user management flow
- [ ] T066 Review and update CLAUDE.md with any new patterns or learnings
- [ ] T067 Security review: verify permission checks, prevent information disclosure, validate inputs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start immediately after Foundational
  - User Story 2 (P2): Can start in parallel with US1, integrates with US1 (list view)
  - User Story 3 (P3): Can start in parallel with US1/US2, integrates with US1 (list view)
  - User Story 4 (P4): Can start in parallel with others, integrates with US1 (list view) and US3 (edit page)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - can start after Foundational
- **User Story 2 (P2)**: Integrates with US1 (adds "Nuevo usuario" button and redirects to list) but independently testable
- **User Story 3 (P3)**: Integrates with US1 (adds edit actions to list) but independently testable
- **User Story 4 (P4)**: Integrates with US1 (adds delete actions) and US3 (delete from edit page) but independently testable

### Within Each User Story

- Type definitions and validators must be created first (Phase 2)
- Data layer functions before API endpoints
- API endpoints before UI components
- Individual UI components (forms, tables, modals) can be built in parallel [P]
- Page components that compose multiple components come last
- Validation and error handling after core functionality
- Testing after implementation

### Parallel Opportunities

**Phase 1 (Setup)**: All 7 tasks marked [P] can run simultaneously

**Phase 2 (Foundational)**: Tasks T008 and T009 marked [P] can run simultaneously, T010 depends on them

**Phase 3 (User Story 1)**:
- T011, T012, T013, T014 marked [P] can run simultaneously
- T015-T019 sequential after T011-T014 complete

**Phase 4 (User Story 2)**:
- T020, T021, T022 marked [P] can run simultaneously
- T023-T028 sequential after T020-T022 complete

**Phase 5 (User Story 3)**:
- T029, T030, T031, T032 marked [P] can run simultaneously
- T033-T041 sequential after T029-T032 complete

**Phase 6 (User Story 4)**:
- T042, T043, T044 marked [P] can run simultaneously
- T045-T053 sequential after T042-T044 complete

**Phase 7 (Polish)**: Tasks T054-T063, T066 marked [P] can run simultaneously, T064-T065, T067 sequential

**Across User Stories**: Once Foundational is complete, all four user stories (Phases 3-6) can be worked on in parallel by different developers

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch these together:
Task: "Implement listUsers function with pagination and filters in src/lib/data/users.ts"
Task: "Create UserListTable component in src/components/users/user-list-table.tsx"
Task: "Create UserFilters component in src/components/users/user-filters.tsx"
Task: "Implement GET /api/users endpoint in src/app/api/users/route.ts"

# Then sequentially build the page that uses them
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (7 tasks, ~30 minutes)
2. Complete Phase 2: Foundational (3 tasks, ~30 minutes) - CRITICAL
3. Complete Phase 3: User Story 1 (9 tasks, ~3-4 hours)
4. **STOP and VALIDATE**: Test viewing, searching, filtering users
5. Deploy/demo if ready - **This is a functional MVP!**

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (~1 hour)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! ~4 hours total)
3. Add User Story 2 → Test independently → Deploy/Demo (~2 hours more)
4. Add User Story 3 → Test independently → Deploy/Demo (~2 hours more)
5. Add User Story 4 → Test independently → Deploy/Demo (~1.5 hours more)
6. Polish phase → Final validation and deployment (~2 hours)

**Total estimated time: 11-12 hours for complete implementation**

### Parallel Team Strategy

With 4 developers:

1. Team completes Setup + Foundational together (~1 hour)
2. Once Foundational is done:
   - Developer A: User Story 1 (View list) - Most critical
   - Developer B: User Story 2 (Create users)
   - Developer C: User Story 3 (Edit users)
   - Developer D: User Story 4 (Delete users)
3. Stories complete and integrate independently
4. Team validates together and completes Polish phase

**Total estimated time with 4 developers: 4-5 hours**

---

## Task Summary

- **Total Tasks**: 67
- **Setup Phase**: 7 tasks
- **Foundational Phase**: 3 tasks (blocking)
- **User Story 1 (P1)**: 9 tasks
- **User Story 2 (P2)**: 9 tasks
- **User Story 3 (P3)**: 13 tasks
- **User Story 4 (P4)**: 12 tasks
- **Polish Phase**: 14 tasks

**Parallel Tasks**: 23 tasks marked [P] can run simultaneously within their phases

**MVP Scope** (Phases 1-3): 19 tasks covering Setup, Foundational, and User Story 1

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Better-auth handles password hashing, session management, and cascade deletion automatically
- No new database tables needed - uses existing better-auth schema
- UI follows existing patterns from items CRUD for consistency
- Permission checks (users:manage) required on all operations
- Tests not included as they were not requested in specification
- Stop at any checkpoint to validate story independently before continuing

---

## Validation Checklist

After completing all tasks, verify:

- [ ] User Story 1: Can view paginated user list with search and filters
- [ ] User Story 2: Can create new users with validation
- [ ] User Story 3: Can edit users with self-ban and last admin protection
- [ ] User Story 4: Can delete users with confirmation and self-deletion prevention
- [ ] All operations restricted to users with "users:manage" permission
- [ ] Email uniqueness enforced on create and edit
- [ ] Filters persist across pagination
- [ ] Sessions terminated when users are deleted
- [ ] Banned users cannot authenticate (shows generic error)
- [ ] Success and error messages display appropriately
- [ ] Forms validate required fields
- [ ] Performance: List loads <2s, searches <1s, operations <500ms
