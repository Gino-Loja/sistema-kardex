# Data Model: User Management CRUD

**Feature**: 002-user-crud
**Date**: 2026-01-13
**Database**: PostgreSQL via Drizzle ORM

## Overview

The user management feature leverages the existing database schema created by better-auth. No new tables are required. This document describes the existing entities and their relationships relevant to user management.

## Existing Entities

### User

**Table**: `user` (already exists)

**Purpose**: Stores user account information including authentication credentials, profile data, and account status.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | text | PRIMARY KEY | Unique identifier (UUID) |
| name | text | NOT NULL | User's display name |
| email | text | NOT NULL, UNIQUE | User's email address (login identifier) |
| emailVerified | boolean | NOT NULL, DEFAULT false | Email verification status |
| image | text | nullable | URL to profile image (optional) |
| role | text | nullable | User's role ("admin" or "bodeguero") |
| banned | boolean | DEFAULT false | Whether user is banned |
| banReason | text | nullable | Reason for ban (if banned) |
| banExpires | timestamp | nullable | Ban expiration date (if temporary) |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Account creation timestamp |
| updatedAt | timestamp | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Unique index on `email`

**Validation Rules**:
- Email must be valid format and unique
- Name must be non-empty string
- Role must be one of: "admin", "bodeguero", or null (defaults to "bodeguero")
- Banned defaults to false if not specified

**State Transitions**:
```
[New User] --> [Active] (created with banned=false)
[Active] --> [Banned] (admin bans user, sets banReason)
[Banned] --> [Active] (admin unbans user, clears banReason)
[Active|Banned] --> [Deleted] (admin deletes user, cascades to sessions)
```

### Session

**Table**: `session` (already exists)

**Purpose**: Tracks active user sessions for authentication. Automatically managed by better-auth.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | text | PRIMARY KEY | Session identifier |
| expiresAt | timestamp | NOT NULL | Session expiration timestamp |
| token | text | NOT NULL, UNIQUE | Session token (secure random) |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Session creation timestamp |
| updatedAt | timestamp | NOT NULL | Last session update |
| ipAddress | text | nullable | IP address of session |
| userAgent | text | nullable | Browser/client user agent |
| userId | text | NOT NULL, FK(user.id) ON DELETE CASCADE | References user |
| impersonatedBy | text | nullable | Admin user ID if impersonating |

**Indexes**:
- Primary key on `id`
- Unique index on `token`
- Index on `userId` for efficient lookups

**Relationships**:
- Many sessions belong to one user
- Cascade delete when user is deleted

**Automatic Cleanup**:
- better-auth automatically removes expired sessions
- Sessions are terminated when user is deleted (cascade)
- Sessions are terminated when user is banned

### Account

**Table**: `account` (already exists)

**Purpose**: Stores authentication credentials (passwords) and OAuth tokens. Managed by better-auth.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | text | PRIMARY KEY | Account identifier |
| accountId | text | NOT NULL | Provider-specific account ID |
| providerId | text | NOT NULL | Auth provider ("credential" for email/password) |
| userId | text | NOT NULL, FK(user.id) ON DELETE CASCADE | References user |
| password | text | nullable | Hashed password (bcrypt/argon2) |
| accessToken | text | nullable | OAuth access token (if OAuth) |
| refreshToken | text | nullable | OAuth refresh token (if OAuth) |
| idToken | text | nullable | OAuth ID token (if OAuth) |
| accessTokenExpiresAt | timestamp | nullable | Access token expiration |
| refreshTokenExpiresAt | timestamp | nullable | Refresh token expiration |
| scope | text | nullable | OAuth scopes |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Account creation timestamp |
| updatedAt | timestamp | NOT NULL | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Index on `userId` for efficient lookups

**Relationships**:
- Many accounts belong to one user (supports multiple auth providers)
- Cascade delete when user is deleted

**Security Notes**:
- Passwords are NEVER stored in plain text
- better-auth automatically hashes passwords using bcrypt/argon2
- Password hashes are NEVER exposed in API responses

## Relationships Diagram

```
┌─────────────┐
│    User     │
│  (id, name, │
│   email,    │
│   role,     │
│   banned)   │
└──────┬──────┘
       │
       │ 1:N (CASCADE DELETE)
       │
       ├──────────────┬──────────────┐
       │              │              │
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ Session  │   │ Account  │   │ Session  │
│ (token,  │   │(password,│   │ (token,  │
│  userId) │   │ userId)  │   │  userId) │
└──────────┘   └──────────┘   └──────────┘
```

## Query Patterns

### List Users (with pagination and filters)

```typescript
// Filter conditions
const conditions = []
if (search) {
  conditions.push(ilike(user.name, `%${search}%`))
}
if (status === 'banned') {
  conditions.push(eq(user.banned, true))
}
if (status === 'active') {
  conditions.push(eq(user.banned, false))
}

// Query with pagination
const users = await db
  .select({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    banned: user.banned,
    createdAt: user.createdAt
  })
  .from(user)
  .where(conditions.length ? and(...conditions) : undefined)
  .orderBy(asc(user.name))
  .limit(pageSize)
  .offset((page - 1) * pageSize)

// Count total for pagination
const [{ count }] = await db
  .select({ count: sql<number>`count(*)` })
  .from(user)
  .where(conditions.length ? and(...conditions) : undefined)
```

### Get User by ID

```typescript
const userDetails = await db
  .select()
  .from(user)
  .where(eq(user.id, userId))
  .limit(1)

if (!userDetails[0]) {
  throw new Error('NOT_FOUND')
}
```

### Create User

```typescript
// Use better-auth admin API (handles password hashing)
const newUser = await auth.api.createUser({
  name: input.name,
  email: input.email,
  password: input.password,
  role: input.role || 'bodeguero'
})
```

### Update User

```typescript
// Use better-auth admin API
const updated = await auth.api.updateUser(userId, {
  name: input.name,
  email: input.email,
  role: input.role,
  banned: input.banned,
  banReason: input.banReason
})
```

### Delete User (with cascade)

```typescript
// Use better-auth admin API (handles cascade)
await auth.api.deleteUser(userId)

// Automatically cascades to:
// - All sessions for this user
// - All accounts for this user
```

## Data Validation

### Create User Validation

```typescript
const userCreateSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'bodeguero'])
})
```

### Update User Validation

```typescript
const userUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'bodeguero']).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional()
})
```

### List Query Validation

```typescript
const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'banned']).optional()
})
```

## Business Rules

1. **Email Uniqueness**: Email addresses must be unique across all users
2. **Role Assignment**: Users must have a role ("admin" or "bodeguero"), defaults to "bodeguero"
3. **Self-Deletion Prevention**: Users cannot delete their own account
4. **Self-Ban Prevention**: Users cannot ban themselves
5. **Session Cleanup**: Deleting a user automatically terminates all their sessions
6. **Password Security**: Passwords are never stored in plain text or exposed in responses
7. **Ban Status**: Banned users cannot authenticate (checked by better-auth)
8. **Default State**: New users are created with `banned=false` and `emailVerified=false`

## Security Considerations

1. **Password Handling**: Always use better-auth API for password operations (never direct DB access)
2. **Permission Checks**: All operations require "users:manage" permission
3. **Session Security**: Session tokens are cryptographically secure random strings
4. **Cascade Deletion**: Foreign key constraints ensure referential integrity
5. **Audit Trail**: Consider logging user management actions for compliance (future enhancement)

## Future Enhancements (Out of Scope)

- Email verification workflow
- Password reset self-service
- Last login tracking
- Login attempt tracking
- Account suspension vs. permanent ban
- Bulk user operations
- User import/export
- Advanced search (by email, role, date ranges)
