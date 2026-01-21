import { NextResponse } from "next/server"

import { deleteItem, getItemById, updateItem } from "@/lib/data/items"
import { getAuthSession } from "@/lib/auth/session"
import { requirePermission } from "@/lib/auth/guards"
import { itemPatchSchema } from "@/lib/validators/item"
import { deleteItemImageByUrl, uploadItemImage } from "@/lib/services/item-image"

const getTextField = (formData: FormData, key: string) => {
  const value = formData.get(key)
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

const getOptionalIdField = (formData: FormData, key: string) => {
  const value = formData.get(key)
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const getFileField = (formData: FormData, key: string) => {
  const value = formData.get(key)
  if (value instanceof File && value.size > 0) {
    return value
  }

  return null
}

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

const requireMastersPermission = async (permission: "masters:read" | "masters:write") => {
  try {
    const session = await getAuthSession()
    requirePermission(session, permission)
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED"
    if (message === "FORBIDDEN") {
      return errorResponse("FORBIDDEN", 403)
    }
    return errorResponse("UNAUTHENTICATED", 401)
  }

  return null
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireMastersPermission("masters:read")
  if (authError) {
    return authError
  }

  const { id } = await context.params
  const item = await getItemById(id)

  if (!item) {
    return errorResponse("NOT_FOUND", 404)
  }

  return NextResponse.json(item)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireMastersPermission("masters:write")
  if (authError) {
    return authError
  }

  const { id } = await context.params
  const existing = await getItemById(id)

  if (!existing) {
    return errorResponse("NOT_FOUND", 404)
  }

  const formData = await request.formData()
  const payload = {
    codigo: getTextField(formData, "codigo"),
    nombre: getTextField(formData, "nombre"),
    descripcion: getTextField(formData, "descripcion"),
    unidadMedida: getTextField(formData, "unidadMedida"),
    categoriaId: getOptionalIdField(formData, "categoriaId"),
    estado: getTextField(formData, "estado"),
  }

  const parsed = itemPatchSchema.safeParse(payload)

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR")
  }

  const image = getFileField(formData, "image")
  const hasFields = Object.values(parsed.data).some((value) => value !== undefined)

  if (!hasFields && !image) {
    return errorResponse("NO_CHANGES")
  }

  let imageUrl: string | undefined

  try {
    if (image) {
      const uploaded = await uploadItemImage({
        itemId: existing.id,
        file: image,
      })
      imageUrl = uploaded.url
    }

    const updated = await updateItem(id, {
      ...parsed.data,
      imagenUrl: imageUrl ?? undefined,
    })

    if (imageUrl && existing.imagenUrl) {
      await deleteItemImageByUrl(existing.imagenUrl)
    }

    return NextResponse.json(updated)
  } catch (error) {
    if (imageUrl) {
      await deleteItemImageByUrl(imageUrl)
    }

    const message = error instanceof Error ? error.message : "UPDATE_FAILED"

    if (message === "ITEM_IMAGE_TOO_LARGE" || message === "ITEM_IMAGE_TYPE_INVALID") {
      return errorResponse(message)
    }

    return errorResponse("UPDATE_FAILED", 500)
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireMastersPermission("masters:write")
  if (authError) {
    return authError
  }

  const { id } = await context.params
  const existing = await getItemById(id)

  if (!existing) {
    return errorResponse("NOT_FOUND", 404)
  }

  try {
    const deleted = await deleteItem(id)

    if (existing.imagenUrl) {
      await deleteItemImageByUrl(existing.imagenUrl)
    }

    return NextResponse.json({ id: deleted.id, imageDeleted: Boolean(existing.imagenUrl) })
  } catch (error) {
    return errorResponse("DELETE_FAILED", 500)
  }
}
