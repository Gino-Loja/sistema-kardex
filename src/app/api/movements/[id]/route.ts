import { NextResponse } from "next/server"

import { getMovementById, updateMovement, deleteMovement } from "@/lib/data/movements"
import { getAuthSession } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { movementUpdateSchema } from "@/lib/validators/movement"

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

const requireMovementsPermission = async (permission: "movements:read" | "movements:write") => {
  try {
    const session = await getAuthSession()
    const user = requirePermission(session, permission)
    return { user, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED"
    if (message === "FORBIDDEN") {
      return { user: null, error: errorResponse("FORBIDDEN", 403) }
    }
    return { user: null, error: errorResponse("UNAUTHENTICATED", 401) }
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireMovementsPermission("movements:read")
  if (error) {
    return error
  }

  const { id } = await context.params

  try {
    const movement = await getMovementById(id)

    if (!movement) {
      return errorResponse("NOT_FOUND", 404)
    }

    return NextResponse.json(movement)
  } catch (error) {
    const message = error instanceof Error ? error.message : "FETCH_FAILED"
    return errorResponse(message, 500)
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireMovementsPermission("movements:write")
  if (error) {
    return error
  }

  const { id } = await context.params

  const body = await request.json().catch(() => null)
  const parsed = movementUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const updated = await updateMovement(id, parsed.data)
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_FAILED"

    if (message === "NOT_FOUND") {
      return errorResponse("NOT_FOUND", 404)
    }

    if (message === "NOT_EDITABLE") {
      return errorResponse("NOT_EDITABLE", 409)
    }

    if (message === "CONCURRENCY_ERROR") {
      return errorResponse("CONCURRENCY_ERROR", 409)
    }

    return errorResponse(message, 500)
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireMovementsPermission("movements:write")
  if (error) {
    return error
  }

  const { id } = await context.params

  try {
    await deleteMovement(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "DELETE_FAILED"

    if (message === "NOT_FOUND") {
      return errorResponse("NOT_FOUND", 404)
    }

    if (message === "NOT_DELETABLE") {
      return errorResponse("NOT_DELETABLE", 409)
    }

    return errorResponse(message, 500)
  }
}
