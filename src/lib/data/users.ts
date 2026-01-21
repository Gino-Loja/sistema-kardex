import { and, asc, eq, ilike, sql } from 'drizzle-orm'
import { db } from '@/lib/drizzle/db'
import { user } from '@/lib/drizzle/schema'
import { auth } from '@/lib/auth/auth'
import type { UserListFilters, UserListResult, UserCreateInput, UserUpdateInput } from '@/lib/types/users'

/**
 * List users with pagination and filters
 */
export const listUsers = async (filters: UserListFilters = {}): Promise<UserListResult> => {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 20
  const offset = (page - 1) * pageSize

  const conditions = []

  // Search by name (case-insensitive partial match)
  if (filters.search) {
    conditions.push(ilike(user.name, `%${filters.search}%`))
  }

  // Filter by status
  if (filters.status === 'banned') {
    conditions.push(eq(user.banned, true))
  } else if (filters.status === 'active') {
    conditions.push(eq(user.banned, false))
  }

  const whereClause = conditions.length ? and(...conditions) : undefined

  // Get paginated users
  const usersData = await db
    .select()
    .from(user)
    .where(whereClause)
    .orderBy(asc(user.name))
    .limit(pageSize)
    .offset(offset)

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(whereClause)

  const users = usersData.map((u) => ({
    ...u,
    role: (u.role ?? 'bodeguero') as 'admin' | 'bodeguero',
    banned: u.banned ?? false,
  }))

  return {
    users,
    total: Number(count),
    page,
    pageSize
  }
}

/**
 * Get user by ID
 */
export const getUserById = async (id: string) => {
  const [foundUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, id))
    .limit(1)

  return foundUser ?? null
}

/**
 * Create a new user using better-auth admin API
 * This creates the user without logging them in (admin-only operation)
 */
export const createUser = async (input: UserCreateInput) => {
  try {
    // Use admin createUser API - creates user without starting a session
    const result = await auth.api.createUser({
      body: {
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role ?? 'bodeguero'
      }
    })

    if (!result) {
      throw new Error('Failed to create user')
    }

    return result
  } catch (error) {
    // Re-throw with better error message
    const message = error instanceof Error ? error.message : 'CREATE_FAILED'
    throw new Error(message)
  }
}

/**
 * Update user details using better-auth API
 */
export const updateUser = async (id: string, input: UserUpdateInput) => {
  try {
    // First check if user exists
    const existingUser = await getUserById(id)
    if (!existingUser) {
      throw new Error('NOT_FOUND')
    }

    // Update user using Drizzle ORM
    // Note: better-auth doesn't have a direct updateUser API in v1.4.10
    // We need to use direct DB updates for non-sensitive fields
    const [updated] = await db
      .update(user)
      .set({
        ...(input.name && { name: input.name }),
        ...(input.email && { email: input.email }),
        ...(input.role && { role: input.role }),
        ...(input.banned !== undefined && { banned: input.banned }),
        ...(input.banReason !== undefined && { banReason: input.banReason }),
        updatedAt: new Date()
      })
      .where(eq(user.id, id))
      .returning()

    return updated
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UPDATE_FAILED'
    throw new Error(message)
  }
}

/**
 * Delete user using better-auth API
 * This ensures sessions are properly terminated
 */
export const deleteUser = async (id: string) => {
  try {
    // First check if user exists
    const existingUser = await getUserById(id)
    if (!existingUser) {
      throw new Error('NOT_FOUND')
    }

    // Delete user - this will cascade to sessions and accounts
    await db.delete(user).where(eq(user.id, id))

    return { id, deleted: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DELETE_FAILED'
    throw new Error(message)
  }
}

/**
 * Count total admin users in the system
 * Used to prevent deletion/demotion of last admin
 */
export const countAdminUsers = async (): Promise<number> => {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(eq(user.role, 'admin'))

  return Number(count)
}
