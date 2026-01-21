# Research: User Management CRUD

**Feature**: 002-user-crud
**Date**: 2026-01-13
**Purpose**: Identify technical decisions and best practices for implementing user CRUD with better-auth

## Research Tasks

### 1. better-auth Admin API Usage Patterns

**Decision**: Use better-auth's built-in admin functions for user management operations

**Rationale**:
- better-auth 1.4.10 provides admin plugin with functions for user CRUD operations
- The codebase already has better-auth configured with admin plugin and access control
- Admin functions handle password hashing, session management, and validation automatically
- Using built-in functions ensures consistency with existing authentication flow

**Key Functions Available**:
- `auth.api.createUser()` - Creates user with hashed password
- `auth.api.updateUser()` - Updates user details
- `auth.api.deleteUser()` - Deletes user and cascades to sessions
- `auth.api.ban()` / `auth.api.unban()` - Manages banned status
- `auth.api.listUsers()` - Queries users with filters

**Alternatives Considered**:
- Direct Drizzle ORM operations on user table - Rejected because it bypasses better-auth's password hashing, validation, and hooks
- Custom repository pattern - Rejected because better-auth already provides a tested API layer

### 2. Permission Check Strategy

**Decision**: Use existing `requirePermission()` guard with "users:manage" permission

**Rationale**:
- The codebase already has `requirePermission()` function in `lib/auth/guards.ts`
- Permission "users:manage" is already defined in `lib/auth/roles.ts` for admin role
- Consistent with other protected routes (items, categories, bodegas)
- Server-side permission checks prevent unauthorized API access

**Implementation Pattern**:
```typescript
// In API routes
const session = await getAuthSession()
requirePermission(session, "users:manage")
```

**Alternatives Considered**:
- Client-side only checks - Rejected due to security risks
- Custom middleware - Rejected as existing guards are sufficient

### 3. Form Validation Approach

**Decision**: Use Zod schemas with React Hook Form for client and server validation

**Rationale**:
- Project already uses Zod (v4.3.5) and React Hook Form (v7.70.0)
- Zod schemas can be reused for both client validation and API validation
- Type-safe validation with TypeScript inference
- Consistent pattern used in existing forms (items, categories)

**Schema Structure**:
- `userCreateSchema` - name, email, password, role (all required)
- `userUpdateSchema` - name, email, role, banned, banReason (all optional except id)
- `userListQuerySchema` - page, pageSize, search, status filters

**Alternatives Considered**:
- Yup validation - Rejected because project uses Zod
- Manual validation - Rejected due to maintenance overhead and lack of type safety

### 4. Password Handling

**Decision**: Let better-auth handle password hashing automatically, validate minimum requirements client-side

**Rationale**:
- better-auth uses bcrypt/argon2 for secure password hashing
- Password validation is handled by better-auth's emailAndPassword plugin
- Never expose password hashes in API responses or UI
- Password changes should only be allowed through dedicated password reset flow

**Validation Rules** (from better-auth defaults):
- Minimum 8 characters
- No maximum length enforced
- No complexity requirements by default

**Alternatives Considered**:
- Manual bcrypt hashing - Rejected to avoid duplicating better-auth logic
- Storing plain passwords - Rejected due to security risks

### 5. Session Management on User Deletion

**Decision**: better-auth automatically cascades session deletion when user is deleted

**Rationale**:
- The database schema has `onDelete: "cascade"` on session.userId foreign key
- better-auth's deleteUser function handles cleanup automatically
- Ensures banned/deleted users cannot use existing sessions
- No manual cleanup required

**Alternatives Considered**:
- Manual session invalidation - Rejected as cascade handles it
- Keeping sessions active - Rejected due to security concerns

### 6. Search and Filter Implementation

**Decision**: Use Drizzle ORM's `ilike()` for name search and `eq()` for status filter

**Rationale**:
- Follows existing pattern in `lib/data/items.ts` listItems function
- `ilike()` provides case-insensitive partial matching for names
- Status filter uses exact match on `banned` boolean field
- Pagination with `limit()` and `offset()` for 20 items per page

**Query Pattern**:
```typescript
const conditions = []
if (search) conditions.push(ilike(user.name, `%${search}%`))
if (status === 'banned') conditions.push(eq(user.banned, true))
if (status === 'active') conditions.push(eq(user.banned, false))
const where = and(...conditions)
```

**Alternatives Considered**:
- Full-text search - Rejected as overkill for name-only search
- Email search - Deferred to keep initial implementation simple

### 7. UI Component Structure

**Decision**: Follow existing pattern with separate list, form, filters, and modal components

**Rationale**:
- Mirrors successful pattern used in items CRUD
- `UserListTable` - Displays paginated data with actions
- `UserFilters` - Search input and status filter dropdown
- `UserForm` - Reusable form for create and edit
- `UserDeleteModal` - Confirmation before deletion
- Separation of concerns improves testability and maintainability

**Component Libraries Used**:
- Base UI React (buttons, inputs, modals)
- Tabler Icons (icons)
- React Hook Form (form state)
- nuqs (URL search params)

**Alternatives Considered**:
- Single monolithic component - Rejected due to low reusability
- Separate create/edit forms - Rejected as they share 90% logic

### 8. Error Handling Strategy

**Decision**: Return structured error responses with specific error codes

**Error Codes**:
- `UNAUTHENTICATED` (401) - No session
- `FORBIDDEN` (403) - Insufficient permissions
- `VALIDATION_ERROR` (400) - Invalid input data
- `EMAIL_EXISTS` (400) - Duplicate email
- `NOT_FOUND` (404) - User not found
- `CANNOT_DELETE_SELF` (400) - Admin trying to delete own account
- `CANNOT_BAN_SELF` (400) - Admin trying to ban self

**Rationale**:
- Consistent with existing API error patterns
- Specific codes help client show appropriate messages
- HTTP status codes follow REST conventions

**Alternatives Considered**:
- Generic error messages - Rejected due to poor UX
- Throwing exceptions - Rejected in favor of explicit error returns

## Technology Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Next.js | 16.1.1 | Full-stack React framework with App Router |
| Auth | better-auth | 1.4.10 | Authentication and user management |
| Database | PostgreSQL | - | Primary data store |
| ORM | Drizzle | 0.41.0 | Type-safe database queries |
| Validation | Zod | 4.3.5 | Schema validation |
| Forms | React Hook Form | 7.70.0 | Form state management |
| Testing | Vitest | 2.1.3 | Unit tests |
| E2E Testing | Playwright | 1.49.0 | End-to-end tests |
| UI Components | Base UI React | 1.0.0 | Accessible UI primitives |

## Best Practices Applied

1. **Server-Side Security**: All sensitive operations happen server-side with permission checks
2. **Type Safety**: TypeScript with Zod schemas ensures type safety across layers
3. **Separation of Concerns**: Clear boundaries between pages, API routes, data access, and UI components
4. **Reusability**: Shared form component for create/edit reduces duplication
5. **Progressive Enhancement**: Pages work with JavaScript disabled (SSR)
6. **Accessibility**: Using Base UI React for accessible components
7. **Performance**: Server-side rendering for initial page load, pagination for large datasets
8. **Security**: Never expose passwords or hashes, automatic session cleanup, permission enforcement

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Admin deletes all admin accounts | High | Prevent last admin deletion in business logic |
| Admin bans themselves | Medium | Prevent self-ban in business logic |
| Concurrent edits to same user | Low | Last-write-wins acceptable for user management |
| Password requirements too weak | Medium | Use better-auth defaults, document for admins |
| Missing audit trail | Medium | better-auth logs can be extended for audit |

## Open Questions

None - All technical decisions have been made based on existing codebase patterns and better-auth documentation.
