"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type { BodegaDetailItem, BodegaItemsPage } from "@/lib/types/bodegas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type WarehouseItemsTableProps = {
  bodegaId: string
  canWrite?: boolean
}

type EditableField = "stockMinimo" | "stockActual" | "stockMaximo" | "costoPromedio"

type ItemDraft = Partial<Record<EditableField, string>>

const stockFields: EditableField[] = ["stockMinimo", "stockActual", "stockMaximo"]

const toDisplayValue = (value: number | null | undefined, field: EditableField) => {
  if (typeof value !== "number") return ""
  // Stock fields are integers, costoPromedio has 2 decimals
  return stockFields.includes(field) ? String(Math.round(value)) : value.toFixed(2)
}

const hasTwoDecimals = (value: string) => {
  const [_, decimals] = value.split(".")
  return !decimals || decimals.length <= 2
}

export function WarehouseItemsTable({
  bodegaId,
  canWrite = false,
}: WarehouseItemsTableProps) {
  const [items, setItems] = useState<BodegaDetailItem[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, ItemDraft>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BodegaDetailItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const hasChanges = useMemo(() => {
    return items.some((item) => {
      const draft = drafts[item.itemId]
      if (!draft) {
        return false
      }

      return (Object.keys(draft) as EditableField[]).some((field) => {
        const draftValue = draft[field]
        if (typeof draftValue !== "string") {
          return false
        }
        const currentValue = toDisplayValue(item[field], field)
        return draftValue.trim() !== currentValue
      })
    })
  }, [drafts, items])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasChanges) {
        return
      }

      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasChanges])

  const loadItems = useCallback(async (nextPage: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(pageSize),
      })
      const response = await fetch(`/api/bodegas/${bodegaId}/items?${params.toString()}`)
      if (!response.ok) {
        throw new Error("FETCH_FAILED")
      }
      const payload = (await response.json()) as BodegaItemsPage
      setItems(Array.isArray(payload.items) ? payload.items : [])
      setTotal(payload.total ?? 0)
    } catch {
      setError("No se pudieron cargar los items asignados.")
    } finally {
      setIsLoading(false)
    }
  }, [bodegaId, pageSize])

  useEffect(() => {
    void loadItems(page)
  }, [loadItems, page])

  useEffect(() => {
    const handleRefresh = () => {
      void loadItems(page)
    }

    window.addEventListener("bodega-items-refresh", handleRefresh)

    return () => {
      window.removeEventListener("bodega-items-refresh", handleRefresh)
    }
  }, [loadItems, page])

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return
    }
    if (hasChanges) {
      const shouldDiscard = window.confirm(
        "Tienes cambios sin guardar. Deseas descartarlos?",
      )
      if (!shouldDiscard) {
        return
      }
      setDrafts({})
    }
    setPage(nextPage)
  }

  const handleChange = (itemId: string, field: EditableField, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }))
  }

  const buildUpdates = () => {
    const updates: Array<{
      itemId: string
      payload: Record<string, number>
      minValue?: number
      maxValue?: number
    }> = []

    for (const item of items) {
      const draft = drafts[item.itemId]
      if (!draft) {
        continue
      }

      const payload: Record<string, number> = {}
      const currentValues = {
        stockMinimo: item.stockMinimo ?? null,
        stockActual: item.stockActual,
        stockMaximo: item.stockMaximo ?? null,
        costoPromedio: item.costoPromedio,
      }

      for (const field of Object.keys(draft) as EditableField[]) {
        const value = draft[field]
        if (typeof value !== "string") {
          continue
        }
        const trimmed = value.trim()
        if (trimmed.length === 0) {
          continue
        }
        if (field === "costoPromedio" && !hasTwoDecimals(trimmed)) {
          throw new Error("COSTO_DECIMALES")
        }
        const parsed = Number(trimmed)
        if (Number.isNaN(parsed) || parsed < 0) {
          throw new Error("VALORES_INVALIDOS")
        }
        const currentValue = currentValues[field]
        if (typeof currentValue === "number" && parsed === currentValue) {
          continue
        }
        payload[field] = parsed
      }

      if (Object.keys(payload).length === 0) {
        continue
      }

      const minValue =
        typeof payload.stockMinimo === "number"
          ? payload.stockMinimo
          : typeof currentValues.stockMinimo === "number"
            ? currentValues.stockMinimo
            : undefined
      const maxValue =
        typeof payload.stockMaximo === "number"
          ? payload.stockMaximo
          : typeof currentValues.stockMaximo === "number"
            ? currentValues.stockMaximo
            : undefined

      updates.push({
        itemId: item.itemId,
        payload,
        minValue,
        maxValue,
      })
    }

    return updates
  }

  const handleSave = async () => {
    setError(null)

    let updates: ReturnType<typeof buildUpdates>
    try {
      updates = buildUpdates()
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      if (message === "COSTO_DECIMALES") {
        setError("El costo unitario debe tener maximo 2 decimales.")
        return
      }
      setError("Revisa los valores ingresados antes de guardar.")
      return
    }

    const invalidRange = updates.find(
      (update) =>
        typeof update.minValue === "number"
        && typeof update.maxValue === "number"
        && update.maxValue < update.minValue,
    )
    if (invalidRange) {
      setError("El stock maximo debe ser mayor o igual al stock minimo.")
      return
    }

    if (updates.length === 0) {
      setDrafts({})
      return
    }

    setIsSaving(true)

    try {
      await Promise.all(
        updates.map((update) =>
          fetch(`/api/bodegas/${bodegaId}/items/${update.itemId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(update.payload),
          }).then((response) => {
            if (!response.ok) {
              throw new Error("UPDATE_FAILED")
            }
          }),
        ),
      )
      setDrafts({})
      await loadItems(page)
    } catch {
      setError("No se pudieron guardar los cambios.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/bodegas/${bodegaId}/items/${deleteTarget.itemId}`,
        { method: "DELETE" },
      )

      if (!response.ok) {
        throw new Error("DELETE_FAILED")
      }

      const shouldMovePage = items.length === 1 && page > 1
      setDeleteTarget(null)
      if (shouldMovePage) {
        setPage(page - 1)
      } else {
        await loadItems(page)
      }
    } catch {
      setError("No se pudo eliminar el item.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
        <div className="text-xs font-semibold text-neutral-500">
          Items asignados
        </div>
        {canWrite && hasChanges ? (
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        ) : null}
      </div>

      <div className="min-w-max">
        <div className="grid grid-cols-[140px_1fr_140px_140px_140px_140px_110px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-500">
          <span>Codigo</span>
          <span>Nombre</span>
          <span>Stock minimo</span>
          <span>Stock actual</span>
          <span>Stock maximo</span>
          <span>Costo unitario</span>
          <span className="text-right">Accion</span>
        </div>

        {isLoading ? (
          <div className="px-4 py-10 text-center text-sm text-neutral-500">
            Cargando items...
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-neutral-500">
            Aun no hay items asignados.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {items.map((item) => {
              const draft = drafts[item.itemId] ?? {}
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[140px_1fr_140px_140px_140px_140px_110px] gap-4 px-4 py-3 text-sm text-neutral-700"
                >
                  <span className="font-medium text-neutral-900">
                    {item.codigo}
                  </span>
                  <span className="text-neutral-600">{item.nombre}</span>
                  {(["stockMinimo", "stockActual", "stockMaximo", "costoPromedio"] as const).map(
                    (field) => (
                      <Input
                        key={field}
                        type="number"
                        inputMode={field === "costoPromedio" ? "decimal" : "numeric"}
                        step={field === "costoPromedio" ? "0.01" : "1"}
                        min="0"
                        value={draft[field] ?? toDisplayValue(item[field], field)}
                        onChange={(event) => handleChange(item.itemId, field, event.target.value)}
                        disabled={!canWrite}
                        className="h-9"
                      />
                    ),
                  )}
                  <div className="text-right">
                    {canWrite ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(item)}
                      >
                        Quitar
                      </Button>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {error ? (
        <div className="border-t border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm text-neutral-600">
        <span>
          Pagina {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar item</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara el item de la bodega.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
