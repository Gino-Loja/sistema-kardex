# Implementation Plan: User Management CRUD

**Branch**: `002-user-crud` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-user-crud/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a complete CRUD system for managing users in the sistema-kardex application. The feature provides administrators with the ability to view, create, edit, and delete user accounts through a web interface at `/settings/users`. The implementation leverages the existing better-auth library for authentication and session management, follows Next.js App Router patterns with server-side rendering, and uses the established permission system to restrict access to users with "users:manage" permission.

Key capabilities:
- Paginated user list (20 per page) with search by name and filter by status
- Create new users with name, email, password, and role assignment
- Edit existing users including role changes and ban status management
- Delete users with confirmation modal and automatic session termination
- Full integration with better-auth admin plugin and role-based access control

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20.x
**Primary Dependencies**: Next.js 16.1.1, better-auth 1.4.10, Drizzle ORM 0.41.0, React 19.2.3, Zod 4.3.5
**Storage**: PostgreSQL (via Drizzle ORM with existing user/session/account tables)
**Testing**: Vitest 2.1.3, Playwright 1.49.0, React Testing Library 16.0.1
**Target Platform**: Web (Next.js App Router with SSR)
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: <2s page load, <1s search/filter operations, <500ms API responses
**Constraints**: Server-side auth validation required, permission checks on all operations, session-based authentication
**Scale/Scope**: Expected to handle hundreds of users, supports pagination for large datasets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: The project constitution file is not yet populated with project-specific principles. The constitution template contains placeholders only. This feature will follow the established patterns observed in the existing codebase:

- **Existing Patterns**: Next.js App Router structure, server-side authentication with better-auth, Drizzle ORM for data access, permission-based authorization, React Hook Form with Zod validation
- **Code Organization**: Feature-based structure with `/app/api` routes, `/components` for UI, `/lib/data` for data access, `/lib/validators` for schemas
- **Testing Approach**: Vitest and Playwright are configured but no existing test files found in src/

**GATE STATUS**: ✅ PASS (no constitution violations as constitution is not yet defined)

## Project Structure

### Documentation (this feature)

```text
specs/002-user-crud/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (dashboard)/
│   │   └── settings/
│   │       └── users/
│   │           ├── page.tsx                    # User list page
│   │           ├── search-params.ts            # URL search params parser
│   │           ├── create/
│   │           │   └── page.tsx                # Create user form page
│   │           └── [id]/
│   │               └── edit/
│   │                   └── page.tsx            # Edit user form page
│   └── api/
│       └── users/
│           ├── route.ts                         # GET (list) / POST (create)
│           └── [id]/
│               └── route.ts                     # GET (detail) / PUT (update) / DELETE
├── components/
│   └── users/
│       ├── user-list-table.tsx                 # Table component with pagination
│       ├── user-filters.tsx                     # Search and status filter components
│       ├── user-form.tsx                        # Shared form for create/edit
│       └── user-delete-modal.tsx               # Confirmation modal for deletion
├── lib/
│   ├── data/
│   │   └── users.ts                            # Data access layer (list, get, create, update, delete)
│   ├── validators/
│   │   └── user.ts                             # Zod schemas for validation
│   └── types/
│       └── users.ts                            # TypeScript types for user entities
└── hooks/
    └── users/
        └── use-users-filters.ts                # Hook for managing filter state

tests/                                           # To be created
├── e2e/
│   └── users/
│       ├── user-list.spec.ts                   # Playwright e2e tests
│       ├── user-create.spec.ts
│       ├── user-edit.spec.ts
│       └── user-delete.spec.ts
└── unit/
    └── lib/
        ├── data/
        │   └── users.test.ts                   # Unit tests for data layer
        └── validators/
            └── user.test.ts                    # Unit tests for validation schemas
```

**Structure Decision**: This is a Next.js web application following the App Router pattern. The feature integrates into the existing dashboard layout under `/settings/users`. The structure mirrors the established pattern used for other CRUD features (items, categories, bodegas) with clear separation between:
- **Pages**: Server components in `app/(dashboard)/settings/users/`
- **API Routes**: RESTful endpoints in `app/api/users/`
- **Components**: Reusable UI components in `components/users/`
- **Data Layer**: Business logic and database queries in `lib/data/users.ts`
- **Validation**: Zod schemas in `lib/validators/user.ts`
- **Types**: TypeScript interfaces in `lib/types/users.ts`

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations identified.
