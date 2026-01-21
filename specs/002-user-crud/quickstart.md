# Quickstart Guide: User Management CRUD

**Feature**: 002-user-crud
**Date**: 2026-01-13
**Target Audience**: Developers implementing the feature

## Overview

This guide provides the essential steps to implement the user management CRUD feature. Follow these steps in order to build a functional user management system integrated with better-auth.

## Prerequisites

- ✅ better-auth 1.4.10 installed and configured
- ✅ PostgreSQL database with user/session/account tables
- ✅ Permission system set up with "users:manage" permission
- ✅ Admin role configured with users:manage permission
- ✅ Next.js App Router project structure
- ✅ Drizzle ORM configured

## Implementation Steps

### Phase 1: Data Layer (Backend Foundation)

#### Step 1.1: Create Type Definitions

**File**: `src/lib/types/users.ts`

Define TypeScript interfaces for user entities and API responses:

```typescript
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'bodeguero'
  banned: boolean
  banReason: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserListFilters {
  page?: number
  pageSize?: number
  search?: string
  status?: 'all' | 'active' | 'banned'
}

export interface UserListResult {
  users: User[]
  total: number
  page: number
  pageSize: number
}
```

**Validation**: Types should match database schema fields.

---

#### Step 1.2: Create Validation Schemas

**File**: `src/lib/validators/user.ts`

Create Zod schemas for request validation:

```typescript
import { z } from 'zod'

export const userCreateSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'bodeguero'])
})

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'bodeguero']).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional()
})

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'banned']).optional()
})
```

**Test**: Run `npm run build` to verify no TypeScript errors.

---

#### Step 1.3: Create Data Access Layer

**File**: `src/lib/data/users.ts`

Implement CRUD operations using Drizzle ORM and better-auth:

```typescript
import { and, asc, eq, ilike, sql } from 'drizzle-orm'
import { db } from '@/lib/drizzle/db'
import { user } from '@/lib/drizzle/schema'
import { auth } from '@/lib/auth/auth'
import type { UserListFilters, UserListResult } from '@/lib/types/users'

export const listUsers = async (filters: UserListFilters): Promise<UserListResult> => {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 20
  const offset = (page - 1) * pageSize

  const conditions = []

  if (filters.search) {
    conditions.push(ilike(user.name, `%${filters.search}%`))
  }

  if (filters.status === 'banned') {
    conditions.push(eq(user.banned, true))
  } else if (filters.status === 'active') {
    conditions.push(eq(user.banned, false))
  }

  const whereClause = conditions.length ? and(...conditions) : undefined

  const users = await db
    .select()
    .from(user)
    .where(whereClause)
    .orderBy(asc(user.name))
    .limit(pageSize)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(whereClause)

  return {
    users,
    total: Number(count),
    page,
    pageSize
  }
}

export const getUserById = async (id: string) => {
  const [foundUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, id))
    .limit(1)

  return foundUser ?? null
}

export const createUser = async (input: {
  name: string
  email: string
  password: string
  role: string
}) => {
  // Use better-auth API for secure password hashing
  return auth.api.createUser({
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role
  })
}

export const updateUser = async (
  id: string,
  input: {
    name?: string
    email?: string
    role?: string
    banned?: boolean
    banReason?: string
  }
) => {
  return auth.api.updateUser(id, input)
}

export const deleteUser = async (id: string) => {
  return auth.api.deleteUser(id)
}
```

**Test**: Create a simple test file or use the API endpoints to verify.

---

### Phase 2: API Layer (REST Endpoints)

#### Step 2.1: Create List/Create Endpoint

**File**: `src/app/api/users/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { listUsers, createUser } from '@/lib/data/users'
import { getAuthSession } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/guards'
import { userCreateSchema, userListQuerySchema } from '@/lib/validators/user'

const requireUsersPermission = async () => {
  try {
    const session = await getAuthSession()
    requirePermission(session, 'users:manage')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNAUTHENTICATED'
    return NextResponse.json(
      { error: message },
      { status: message === 'FORBIDDEN' ? 403 : 401 }
    )
  }
  return null
}

export async function GET(request: Request) {
  const authError = await requireUsersPermission()
  if (authError) return authError

  const { searchParams } = new URL(request.url)

  const parsed = userListQuerySchema.safeParse({
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
    search: searchParams.get('search'),
    status: searchParams.get('status')
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'PARAMS_INVALID' }, { status: 400 })
  }

  const result = await listUsers(parsed.data)
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const authError = await requireUsersPermission()
  if (authError) return authError

  const body = await request.json()
  const parsed = userCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 })
  }

  try {
    const created = await createUser(parsed.data)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CREATE_FAILED'

    if (message.includes('duplicate') || message.includes('unique')) {
      return NextResponse.json({ error: 'EMAIL_EXISTS' }, { status: 400 })
    }

    return NextResponse.json({ error: 'CREATE_FAILED' }, { status: 500 })
  }
}
```

**Test**: Use curl or Postman to test GET and POST endpoints.

---

#### Step 2.2: Create Detail/Update/Delete Endpoint

**File**: `src/app/api/users/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getUserById, updateUser, deleteUser } from '@/lib/data/users'
import { getAuthSession } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/guards'
import { userUpdateSchema } from '@/lib/validators/user'

const requireUsersPermission = async () => {
  try {
    const session = await getAuthSession()
    requirePermission(session, 'users:manage')
    return session
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNAUTHENTICATED'
    return NextResponse.json(
      { error: message },
      { status: message === 'FORBIDDEN' ? 403 : 401 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = await requireUsersPermission()
  if (authError instanceof NextResponse) return authError

  const user = await getUserById(params.id)

  if (!user) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireUsersPermission()
  if (session instanceof NextResponse) return session

  // Prevent self-ban
  if (session.user.id === params.id) {
    const body = await request.json()
    if (body.banned === true) {
      return NextResponse.json({ error: 'CANNOT_BAN_SELF' }, { status: 400 })
    }
  }

  const body = await request.json()
  const parsed = userUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 })
  }

  try {
    const updated = await updateUser(params.id, parsed.data)
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UPDATE_FAILED'

    if (message.includes('duplicate') || message.includes('unique')) {
      return NextResponse.json({ error: 'EMAIL_EXISTS' }, { status: 400 })
    }

    if (message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ error: 'UPDATE_FAILED' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireUsersPermission()
  if (session instanceof NextResponse) return session

  // Prevent self-deletion
  if (session.user.id === params.id) {
    return NextResponse.json({ error: 'CANNOT_DELETE_SELF' }, { status: 400 })
  }

  try {
    await deleteUser(params.id)
    return NextResponse.json({ id: params.id, deleted: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DELETE_FAILED'

    if (message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
    }

    return NextResponse.json({ error: 'DELETE_FAILED' }, { status: 500 })
  }
}
```

**Test**: Test all three HTTP methods (GET, PUT, DELETE) with different scenarios.

---

### Phase 3: UI Layer (React Components)

#### Step 3.1: Create Search Params Parser

**File**: `src/app/(dashboard)/settings/users/search-params.ts`

```typescript
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server'

export const usersSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  search: parseAsString,
  status: parseAsString
}

export const loadUsersSearchParams = createSearchParamsCache(usersSearchParams)
```

---

#### Step 3.2: Create User List Page

**File**: `src/app/(dashboard)/settings/users/page.tsx`

```typescript
import Link from 'next/link'
import { listUsers } from '@/lib/data/users'
import { getAuthSession } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/guards'
import { UserListTable } from '@/components/users/user-list-table'
import { UserFilters } from '@/components/users/user-filters'
import { Button } from '@/components/ui/button'
import { loadUsersSearchParams } from './search-params'

export default async function UsersPage({ searchParams }) {
  const resolved = await loadUsersSearchParams(searchParams)
  const session = await getAuthSession()

  if (!hasPermission(session?.user?.role, 'users:manage')) {
    return <div>Access Denied</div>
  }

  const result = await listUsers(resolved)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Users</h1>
            <p className="text-sm text-neutral-600">
              Manage user accounts and permissions
            </p>
          </div>
          <Button asChild>
            <Link href="/settings/users/create">Nuevo usuario</Link>
          </Button>
        </div>
        <UserFilters />
      </header>

      <UserListTable users={result.users} />

      {/* Pagination controls here */}
    </div>
  )
}
```

---

#### Step 3.3: Create User Form Component

**File**: `src/components/users/user-form.tsx`

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userCreateSchema } from '@/lib/validators/user'

export function UserForm({ initialData, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(userCreateSchema),
    defaultValues: initialData
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

---

#### Step 3.4: Create User List Table Component

**File**: `src/components/users/user-list-table.tsx`

```typescript
'use client'

export function UserListTable({ users }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{user.banned ? 'Banned' : 'Active'}</td>
            <td>
              {/* Edit and Delete buttons */}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

### Phase 4: Testing

#### Step 4.1: Unit Tests

Create tests for validators and data layer:

```bash
npm run test src/lib/validators/user.test.ts
npm run test src/lib/data/users.test.ts
```

#### Step 4.2: End-to-End Tests

Create Playwright tests:

```bash
npx playwright test tests/e2e/users/user-list.spec.ts
```

---

## Verification Checklist

- [ ] API endpoints respond correctly (GET, POST, PUT, DELETE)
- [ ] Validation works for all inputs
- [ ] Permission checks prevent unauthorized access
- [ ] Cannot delete/ban self
- [ ] Email uniqueness is enforced
- [ ] Sessions are terminated on user deletion
- [ ] Pagination works correctly
- [ ] Search filter works
- [ ] Status filter works
- [ ] UI displays users correctly
- [ ] Forms handle errors gracefully

## Common Issues and Solutions

### Issue: "Email already exists" when creating user

**Solution**: Ensure email uniqueness check is working. Verify no duplicate emails in database.

### Issue: Cannot delete user - "CANNOT_DELETE_SELF"

**Solution**: This is expected behavior. Log in as a different admin to delete the user.

### Issue: Better-auth API not found

**Solution**: Verify better-auth is properly configured in `src/lib/auth/auth.ts` with admin plugin enabled.

## Next Steps

After basic implementation:

1. Add email verification workflow
2. Implement password reset functionality
3. Add audit logging for user management actions
4. Implement bulk user operations
5. Add advanced search (by email, role, date ranges)

## Resources

- [better-auth Documentation](https://better-auth.com)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Drizzle ORM](https://orm.drizzle.team)
- [Zod Validation](https://zod.dev)
