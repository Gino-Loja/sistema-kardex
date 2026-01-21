import { NextResponse } from 'next/server'
import { getUserById, updateUser, deleteUser, countAdminUsers } from '@/lib/data/users'
import { getAuthSession } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/guards'
import { userUpdateSchema } from '@/lib/validators/user'

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

const requireUsersPermission = async () => {
  try {
    const session = await getAuthSession()
    const user = requirePermission(session, 'users:manage')
    return { user }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNAUTHENTICATED'
    if (message === 'FORBIDDEN') {
      return errorResponse('FORBIDDEN', 403)
    }
    return errorResponse('UNAUTHENTICATED', 401)
  }
}

/**
 * GET /api/users/[id] - Get user by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireUsersPermission()
  if (authError instanceof NextResponse) {
    return authError
  }

  const { id } = await params

  try {
    const user = await getUserById(id)

    if (!user) {
      return errorResponse('NOT_FOUND', 404)
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return errorResponse('QUERY_FAILED', 500)
  }
}

/**
 * PUT /api/users/[id] - Update user
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireUsersPermission()
  if (session instanceof NextResponse) {
    return session
  }

  const { id } = await params

  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('INVALID_JSON')
  }

  // Prevent self-ban
  if (session.user.id === id && body.banned === true) {
    return errorResponse('CANNOT_BAN_SELF')
  }

  // Prevent last admin protection (role change or ban)
  const currentUser = await getUserById(id)
  if (currentUser?.role === 'admin') {
    const adminCount = await countAdminUsers()

    // If this is the last admin and trying to change role or ban
    if (adminCount === 1) {
      if (body.role && body.role !== 'admin') {
        return errorResponse('CANNOT_REMOVE_LAST_ADMIN')
      }
      if (body.banned === true) {
        return errorResponse('CANNOT_BAN_LAST_ADMIN')
      }
    }
  }

  const parsed = userUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: parsed.error.issues },
      { status: 400 }
    )
  }

  try {
    const updated = await updateUser(id, parsed.data)
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UPDATE_FAILED'

    if (message.includes('duplicate') || message.includes('unique') || message.includes('already')) {
      return errorResponse('EMAIL_EXISTS')
    }

    if (message === 'NOT_FOUND') {
      return errorResponse('NOT_FOUND', 404)
    }

    console.error('Error updating user:', error)
    return errorResponse('UPDATE_FAILED', 500)
  }
}

/**
 * DELETE /api/users/[id] - Delete user
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireUsersPermission()
  if (session instanceof NextResponse) {
    return session
  }

  const { id } = await params

  // Prevent self-deletion
  if (session.user.id === id) {
    return errorResponse('CANNOT_DELETE_SELF')
  }

  // Prevent last admin deletion
  const currentUser = await getUserById(id)
  if (currentUser?.role === 'admin') {
    const adminCount = await countAdminUsers()
    if (adminCount === 1) {
      return errorResponse('CANNOT_DELETE_LAST_ADMIN')
    }
  }

  try {
    await deleteUser(id)
    return NextResponse.json({ id, deleted: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DELETE_FAILED'

    if (message === 'NOT_FOUND') {
      return errorResponse('NOT_FOUND', 404)
    }

    console.error('Error deleting user:', error)
    return errorResponse('DELETE_FAILED', 500)
  }
}
