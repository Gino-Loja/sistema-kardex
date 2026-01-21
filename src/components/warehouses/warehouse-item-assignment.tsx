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

type SelectedItemData = {
  itemId: string
  stockInicial: number
  costoUnitario: number
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
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItemData>>(new Map())
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
    setSelectedItems((prev) => {
      const newMap = new Map(prev)
      if (newMap.has(itemId)) {
        newMap.delete(itemId)
      } else {
        newMap.set(itemId, { itemId, stockInicial: 0, costoUnitario: 0 })
      }
      return newMap
    })
  }

  const updateItemData = (itemId: string, field: "stockInicial" | "costoUnitario", value: number) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(itemId)
      if (current) {
        newMap.set(itemId, { ...current, [field]: value })
      }
      return newMap
    })
  }

  const handleSubmit = async () => {
    if (disabled || selectedItems.size === 0) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const itemsToAssign = Array.from(selectedItems.values())

      const response = await fetch(`/api/bodegas/${bodegaId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: itemsToAssign }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = payload?.error

        if (message === "ITEM_ALREADY_ASSIGNED" || message === "ITEMS_ALREADY_ASSIGNED") {
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

      setSelectedItems(new Map())
      setIsOpen(false)
      window.dispatchEvent(new Event("bodega-items-refresh"))
      router.refresh()
    } catch {
      setError("Ocurrio un error inesperado.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getItemInfo = (itemId: string) => items.find((i) => i.id === itemId)

  return (
    <div className="flex flex-col items-end gap-1">
      <Sheet
        open={isOpen}
        onOpenChange={(nextOpen) => {
          setIsOpen(nextOpen)
          if (!nextOpen) {
            setSelectedItems(new Map())
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
        <SheetContent side="right" className="sm:max-w-lg flex flex-col h-full p-0">
          <SheetHeader className="px-4 pt-4 pb-2 flex-shrink-0">
            <SheetTitle>Seleccionar items</SheetTitle>
            <SheetDescription>
              Busca y selecciona los items. Puedes especificar stock inicial y costo.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4">
            <div className="grid gap-3 pb-4">
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
                <div className="grid gap-2 rounded-lg border border-neutral-200 p-3 text-sm text-neutral-700">
                  {items.map((item) => {
                    const isAssigned = assignedSet.has(item.id)
                    const isSelected = selectedItems.has(item.id)
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
                            checked={isSelected}
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

              {selectedItems.size > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="mb-2 text-xs font-medium text-blue-700">
                    Items seleccionados ({selectedItems.size})
                  </p>
                  <div className="grid gap-3">
                    {Array.from(selectedItems.values()).map((selected) => {
                      const itemInfo = getItemInfo(selected.itemId)
                      return (
                        <div
                          key={selected.itemId}
                          className="rounded-md bg-white p-2 text-xs"
                        >
                          <p className="font-medium text-neutral-700 mb-2">
                            {itemInfo?.codigo} - {itemInfo?.nombre}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-neutral-500">Stock inicial</label>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                value={selected.stockInicial || ""}
                                onChange={(e) =>
                                  updateItemData(
                                    selected.itemId,
                                    "stockInicial",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-neutral-500">Costo unitario</label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={selected.costoUnitario || ""}
                                onChange={(e) =>
                                  updateItemData(
                                    selected.itemId,
                                    "costoUnitario",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="0.00"
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {error ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              ) : null}
            </div>
          </div>

          <SheetFooter className="flex-shrink-0 border-t border-neutral-200 px-4 py-3">
            <Button
              type="button"
              disabled={disabled || isSubmitting || selectedItems.size === 0}
              onClick={handleSubmit}
              className="w-full"
            >
              {isSubmitting ? "Asignando..." : `Asignar ${selectedItems.size} item${selectedItems.size !== 1 ? "s" : ""}`}
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
