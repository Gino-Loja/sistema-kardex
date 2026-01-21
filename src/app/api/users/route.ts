import { NextResponse } from 'next/server'
import { listUsers, createUser } from '@/lib/data/users'
import { getAuthSession } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/guards'
import { userCreateSchema, userListQuerySchema } from '@/lib/validators/user'

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

const requireUsersPermission = async () => {
  try {
    const session = await getAuthSession()
    requirePermission(session, 'users:manage')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNAUTHENTICATED'
    if (message === 'FORBIDDEN') {
      return errorResponse('FORBIDDEN', 403)
    }
    return errorResponse('UNAUTHENTICATED', 401)
  }

  return null
}

/**
 * GET /api/users - List users with pagination and filters
 */
export async function GET(request: Request) {
  const authError = await requireUsersPermission()
  if (authError) {
    return authError
  }

  const { searchParams } = new URL(request.url)

  const parsed = userListQuerySchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    status: searchParams.get('status') ?? undefined
  })

  if (!parsed.success) {
    return errorResponse('PARAMS_INVALID')
  }

  try {
    const result = await listUsers(parsed.data)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error listing users:', error)
    return errorResponse('QUERY_FAILED', 500)
  }
}

/**
 * POST /api/users - Create new user
 */
export async function POST(request: Request) {
  const authError = await requireUsersPermission()
  if (authError) {
    return authError
  }

  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('INVALID_JSON')
  }

  const parsed = userCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: parsed.error.issues },
      { status: 400 }
    )
  }

  try {
    const created = await createUser(parsed.data)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CREATE_FAILED'

    // Check for duplicate email
    if (message.includes('duplicate') || message.includes('unique') || message.includes('already')) {
      return errorResponse('EMAIL_EXISTS')
    }

    console.error('Error creating user:', error)
    return errorResponse('CREATE_FAILED', 500)
  }
}
