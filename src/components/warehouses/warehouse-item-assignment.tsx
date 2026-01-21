"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type ItemOption = {
  id: string
  codigo: string
  nombre: string
  estado: string
}

type WarehouseItemAssignmentProps = {
  bodegaId: string
  bodegaEstado: string
  assignedItemIds: string[]
  canAssign?: boolean
}

export function WarehouseItemAssignment({
  bodegaId,
  bodegaEstado,
  assignedItemIds,
  canAssign = false,
}: WarehouseItemAssignmentProps) {
  const router = useRouter()
  const [items, setItems] = useState<ItemOption[]>([])
  const [itemsPage, setItemsPage] = useState(1)
  const [itemsTotal, setItemsTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [assignedIds, setAssignedIds] = useState<string[]>(assignedItemIds)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const pageSize = 20

  const totalPages = Math.max(1, Math.ceil(itemsTotal / pageSize))

  const loadAssignedIds = useCallback(async () => {
    setIsLoadingAssigned(true)
    try {
      const collected: string[] = []
      let page = 1
      let total = 0

      do {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: "100",
        })
        const response = await fetch(`/api/bodegas/${bodegaId}/items?${params.toString()}`)
        if (!response.ok) {
          throw new Error("ASSIGNED_FETCH_FAILED")
        }
        const payload = await response.json()
        const pageItems = Array.isArray(payload?.items) ? payload.items : []
        if (total === 0) {
          total = typeof payload?.total === "number" ? payload.total : pageItems.length
        }
        collected.push(...pageItems.map((item: { itemId: string }) => item.itemId))
        page += 1
      } while (collected.length < total)

      setAssignedIds(collected)
    } catch {
      setAssignedIds(assignedItemIds)
    } finally {
      setIsLoadingAssigned(false)
    }
  }, [assignedItemIds, bodegaId])

  const loadItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        status: "activo",
        page: String(itemsPage),
        pageSize: String(pageSize),
      })

      if (query.length > 0) {
        params.set("search", query)
      }

      const response = await fetch(`/api/items?${params.toString()}`)
      if (!response.ok) {
        throw new Error("FETCH_FAILED")
      }
      const data = await response.json()
      const options = Array.isArray(data?.items) ? data.items : []
      setItems(options)
      setItemsTotal(typeof data?.total === "number" ? data.total : options.length)
    } catch {
      setError("No se pudieron cargar los items activos.")
    } finally {
      setIsLoading(false)
    }
  }, [itemsPage, pageSize, query])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    void loadAssignedIds()
  }, [isOpen, loadAssignedIds])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    void loadItems()
  }, [isOpen, loadItems])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(search.trim())
      setItemsPage(1)
    }, 300)

    return () => clearTimeout(timeout)
  }, [search])

  const disabled = !canAssign || bodegaEstado === "inactivo"

  const assignedSet = useMemo(() => new Set(assignedIds), [assignedIds])

  const statusMessage = !canAssign
    ? "No tienes permisos para asignar items."
    : bodegaEstado === "inactivo"
      ? "La bodega esta inactiva y no permite nuevas asignaciones."
      : null

  const toggleSelection = (itemId: string) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    )
  }

  const handleSubmit = async () => {
    if (disabled || selectedIds.length === 0) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/bodegas/${bodegaId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemIds: selectedIds }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = payload?.error

        if (message === "ITEM_ALREADY_ASSIGNED") {
          setError("Uno o mas items ya estaban asignados.")
        } else if (message === "ITEM_INACTIVE") {
          setError("Solo se pueden asignar items activos.")
        } else if (message === "BODEGA_INACTIVE") {
          setError("La bodega esta inactiva.")
        } else {
          setError("No se pudo asignar los items.")
        }
        return
      }

      setSelectedIds([])
      setIsOpen(false)
      window.dispatchEvent(new Event("bodega-items-refresh"))
      router.refresh()
    } catch {
      setError("Ocurrio un error inesperado.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Sheet
        open={isOpen}
        onOpenChange={(nextOpen) => {
          setIsOpen(nextOpen)
          if (!nextOpen) {
            setSelectedIds([])
            setSearch("")
            setQuery("")
            setError(null)
          }
        }}
      >
        <SheetTrigger asChild>
          <Button type="button" disabled={disabled}>
            Asignar items
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-lg px-3 py-3">
          <SheetHeader className="px-0 pt-0">
            <SheetTitle>Seleccionar items</SheetTitle>
            <SheetDescription>
              Busca y selecciona los items que deseas asignar a la bodega.
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-3">
            <Input
              placeholder="Buscar por codigo o nombre"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {isLoading || isLoadingAssigned ? (
              <div className="text-sm text-neutral-500">Cargando items...</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-neutral-500">
                No hay items activos disponibles.
              </div>
            ) : (
              <div className="grid max-h-72 gap-2 overflow-y-auto rounded-lg border border-neutral-200 p-3 text-sm text-neutral-700">
                {items.map((item) => {
                  const isAssigned = assignedSet.has(item.id)
                  return (
                    <label
                      key={item.id}
                      className={`flex items-center justify-between gap-3 rounded-md px-2 py-1 ${
                        isAssigned ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          disabled={disabled || isAssigned}
                        />
                        <span className="font-medium">
                          {item.codigo}
                        </span>
                        <span className="text-neutral-500">
                          {item.nombre}
                        </span>
                      </div>
                      {isAssigned ? (
                        <span className="text-xs text-neutral-400">
                          Asignado
                        </span>
                      ) : null}
                    </label>
                  )
                })}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>
                Pagina {itemsPage} de {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setItemsPage((prev) => Math.max(1, prev - 1))}
                  disabled={itemsPage <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setItemsPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={itemsPage >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </div>

          <SheetFooter className="px-0 pb-0">
            <Button
              type="button"
              disabled={disabled || isSubmitting || selectedIds.length === 0}
              onClick={handleSubmit}
              className="w-full"
            >
              {isSubmitting ? "Asignando..." : "Asignar items"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {statusMessage ? (
        <span className="text-xs text-neutral-500">{statusMessage}</span>
      ) : null}
    </div>
  )
}
