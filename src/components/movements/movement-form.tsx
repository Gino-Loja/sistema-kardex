"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { IconPlus, IconTrash, IconLock, IconAlertTriangle, IconLoader } from "@tabler/icons-react"

import type { MovementType, MovementDetailInput } from "@/lib/validators/movement"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAverageCost } from "@/hooks/movements/use-average-cost"
import { formatCurrency, formatNumber } from "@/lib/utils"

type BodegaOption = {
  id: string
  nombre: string
  identificacion: string
}

type ItemOption = {
  id: string
  codigo: string
  nombre: string
  costoPromedio: number
}

type TerceroOption = {
  id: string
  nombre: string
  identificacion: string
  tipo: string
}

type MovementFormValues = {
  tipo: MovementType
  fecha: string
  bodegaOrigenId: string | null
  bodegaDestinoId: string | null
  terceroId: string | null
  documentoReferencia: string
  observacion: string
  detalles: Array<{
    itemId: string
    cantidad: number
    costoUnitario: number
  }>
  version?: number
}

type MovementFormProps = {
  mode: "create" | "edit"
  movementId?: string
  initialValues?: MovementFormValues
}

const formatDateForInput = (date: Date) => {
  return date.toISOString().split("T")[0]
}

export function MovementForm({ mode, movementId, initialValues }: MovementFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [bodegas, setBodegas] = useState<BodegaOption[]>([])
  const [items, setItems] = useState<ItemOption[]>([])
  const [terceros, setTerceros] = useState<TerceroOption[]>([])

  const [values, setValues] = useState<MovementFormValues>({
    tipo: initialValues?.tipo ?? "entrada",
    fecha: initialValues?.fecha ?? formatDateForInput(new Date()),
    bodegaOrigenId: initialValues?.bodegaOrigenId ?? null,
    bodegaDestinoId: initialValues?.bodegaDestinoId ?? null,
    terceroId: initialValues?.terceroId ?? null,
    documentoReferencia: initialValues?.documentoReferencia ?? "",
    observacion: initialValues?.observacion ?? "",
    detalles: initialValues?.detalles ?? [{ itemId: "", cantidad: 1, costoUnitario: 0 }],
    version: initialValues?.version,
  })

  // Load bodegas
  useEffect(() => {
    let active = true

    const loadBodegas = async () => {
      try {
        const response = await fetch("/api/bodegas?pageSize=100")
        if (!response.ok) return
        const data = await response.json()
        if (active) {
          setBodegas(data.items ?? data)
        }
      } catch {
        // Ignore fetch errors
      }
    }

    void loadBodegas()
    return () => { active = false }
  }, [])

  // Load items
  useEffect(() => {
    let active = true

    const loadItems = async () => {
      try {
        const response = await fetch("/api/items?pageSize=100")
        if (!response.ok) return
        const data = await response.json()
        if (active) {
          setItems(data.items ?? data)
        }
      } catch {
        // Ignore fetch errors
      }
    }

    void loadItems()
    return () => { active = false }
  }, [])

  // Load terceros
  useEffect(() => {
    let active = true

    const loadTerceros = async () => {
      try {
        const response = await fetch("/api/third-parties?pageSize=100")
        if (!response.ok) return
        const data = await response.json()
        if (active) {
          setTerceros(data.items ?? data)
        }
      } catch {
        // Ignore fetch errors
      }
    }

    void loadTerceros()
    return () => { active = false }
  }, [])

  // Clear bodega fields when tipo changes and reset costs for salida/transferencia
  const handleTipoChange = (newTipo: MovementType) => {
    const isNewTypeReadonlyCost = newTipo === "salida" || newTipo === "transferencia"

    setValues((prev) => {
      const newDetalles = isNewTypeReadonlyCost
        ? prev.detalles.map((d) => ({ ...d, costoUnitario: 0 })) // Will be filled by useEffect
        : prev.detalles

      return {
        ...prev,
        tipo: newTipo,
        bodegaOrigenId: newTipo === "entrada" ? null : prev.bodegaOrigenId,
        bodegaDestinoId: newTipo === "salida" ? null : prev.bodegaDestinoId,
        detalles: newDetalles,
      }
    })
    setErrors((prev) => {
      const next = { ...prev }
      delete next.bodegaOrigenId
      delete next.bodegaDestinoId
      return next
    })
  }

  const handleChange = <K extends keyof MovementFormValues>(key: K, value: MovementFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleDetailChange = (index: number, key: keyof MovementDetailInput, value: string | number) => {
    setValues((prev) => {
      const newDetalles = [...prev.detalles]
      newDetalles[index] = { ...newDetalles[index], [key]: value }

      // If changing itemId, set the cost based on movement type
      if (key === "itemId" && typeof value === "string" && value) {
        const selectedItem = items.find((i) => i.id === value)

        if (isCostReadonly) {
          // For salida/transferencia: use average cost from bodega, fallback to item reference price
          const itemCost = averageCosts[value]
          if (itemCost && itemCost.costoPromedio > 0) {
            newDetalles[index].costoUnitario = itemCost.costoPromedio
          } else if (selectedItem && selectedItem.costoPromedio > 0) {
            // Fallback to item's reference price
            newDetalles[index].costoUnitario = selectedItem.costoPromedio
          }
        } else {
          // For entrada: pre-fill with item's reference price
          if (selectedItem && selectedItem.costoPromedio > 0) {
            newDetalles[index].costoUnitario = selectedItem.costoPromedio
          }
        }
      }

      return { ...prev, detalles: newDetalles }
    })
  }

  const addDetailLine = () => {
    setValues((prev) => ({
      ...prev,
      detalles: [...prev.detalles, { itemId: "", cantidad: 1, costoUnitario: 0 }],
    }))
  }

  const removeDetailLine = (index: number) => {
    if (values.detalles.length <= 1) return
    setValues((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index),
    }))
  }

  const calculateLineTotal = (cantidad: number, costoUnitario: number) => {
    return cantidad * costoUnitario
  }

  const calculateGrandTotal = () => {
    return values.detalles.reduce((acc, d) => acc + calculateLineTotal(d.cantidad, d.costoUnitario), 0)
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!values.fecha) {
      nextErrors.fecha = "La fecha es obligatoria."
    }

    // Conditional bodega validation
    if (values.tipo === "entrada" && !values.bodegaDestinoId) {
      nextErrors.bodegaDestinoId = "Bodega destino es requerida para entradas."
    }

    if (values.tipo === "salida" && !values.bodegaOrigenId) {
      nextErrors.bodegaOrigenId = "Bodega origen es requerida para salidas."
    }

    if (values.tipo === "transferencia") {
      if (!values.bodegaOrigenId) {
        nextErrors.bodegaOrigenId = "Bodega origen es requerida para transferencias."
      }
      if (!values.bodegaDestinoId) {
        nextErrors.bodegaDestinoId = "Bodega destino es requerida para transferencias."
      }
      if (values.bodegaOrigenId && values.bodegaDestinoId && values.bodegaOrigenId === values.bodegaDestinoId) {
        nextErrors.bodegaDestinoId = "Bodega origen y destino deben ser diferentes."
      }
    }

    // Validate detalles
    if (values.detalles.length === 0) {
      nextErrors.detalles = "Al menos un item es requerido."
    }

    values.detalles.forEach((d, i) => {
      if (!d.itemId) {
        nextErrors[`detalles.${i}.itemId`] = "Seleccione un item."
      }
      if (d.cantidad <= 0) {
        nextErrors[`detalles.${i}.cantidad`] = "La cantidad debe ser mayor a 0."
      }
    })

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    const payload = {
      tipo: values.tipo,
      fecha: values.fecha,
      bodegaOrigenId: values.bodegaOrigenId || null,
      bodegaDestinoId: values.bodegaDestinoId || null,
      terceroId: values.terceroId || null,
      documentoReferencia: values.documentoReferencia || null,
      observacion: values.observacion || null,
      detalles: values.detalles.map((d) => ({
        itemId: d.itemId,
        cantidad: d.cantidad,
        costoUnitario: d.costoUnitario || undefined,
      })),
      version: values.version,
    }

    try {
      const response = await fetch(
        mode === "create" ? "/api/movements" : `/api/movements/${movementId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (data.error === "STOCK_INSUFFICIENT") {
          const details = data.details ? `: ${data.details}` : ""
          setErrors({ form: `Stock insuficiente${details}` })
        } else if (data.error === "NOT_EDITABLE") {
          setErrors({ form: "Este movimiento no puede ser editado." })
        } else if (data.error === "CONCURRENCY_ERROR") {
          setErrors({ form: "Este documento ha sido modificado por otro usuario. Por favor, recargue la página." })
        } else {
          setErrors({ form: data.error ?? "No se pudo guardar el movimiento." })
        }
        return
      }

      router.push("/movements")
      router.refresh()
    } catch {
      setErrors({ form: "Ocurrió un error inesperado." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const showBodegaOrigen = values.tipo === "salida" || values.tipo === "transferencia"
  const showBodegaDestino = values.tipo === "entrada" || values.tipo === "transferencia"

  // Determine if costs should be auto-calculated (readonly for salida/transferencia)
  const isCostReadonly = values.tipo === "salida" || values.tipo === "transferencia"
  const costSourceBodegaId = showBodegaOrigen ? values.bodegaOrigenId : null

  // Get item IDs for average cost lookup
  const itemIdsForCost = useMemo(() => {
    return values.detalles
      .map((d) => d.itemId)
      .filter((id) => id && id.trim().length > 0)
  }, [values.detalles])

  // Get selected item IDs to prevent duplicates
  const selectedItemIds = useMemo(() => {
    return new Set(values.detalles.map((d) => d.itemId).filter((id) => id && id.trim().length > 0))
  }, [values.detalles])

  // Check if an item is already selected in another row
  const isItemAlreadySelected = (itemId: string, currentIndex: number): boolean => {
    return values.detalles.some((d, i) => i !== currentIndex && d.itemId === itemId)
  }

  // Fetch average costs when type requires auto-cost (salida/transferencia)
  const { costs: averageCosts, isLoading: isLoadingCosts } = useAverageCost({
    bodegaId: costSourceBodegaId,
    itemIds: itemIdsForCost,
    enabled: isCostReadonly && Boolean(costSourceBodegaId),
  })

  // Auto-update costs when average costs are loaded for salida/transferencia
  useEffect(() => {
    if (!isCostReadonly || !costSourceBodegaId) {
      return
    }

    setValues((prev) => {
      const newDetalles = prev.detalles.map((detalle) => {
        if (!detalle.itemId) return detalle

        // Try bodega cost first, then fallback to item reference price
        const bodegaCost = averageCosts[detalle.itemId]?.costoPromedio ?? 0
        const selectedItem = items.find((i) => i.id === detalle.itemId)
        const itemRefPrice = selectedItem?.costoPromedio ?? 0

        const finalCost = bodegaCost > 0 ? bodegaCost : (itemRefPrice > 0 ? itemRefPrice : 0)

        return {
          ...detalle,
          costoUnitario: finalCost,
        }
      })

      const hasChanges = newDetalles.some((d, i) => d.costoUnitario !== prev.detalles[i].costoUnitario)
      return hasChanges ? { ...prev, detalles: newDetalles } : prev
    })
  }, [averageCosts, isCostReadonly, costSourceBodegaId, items])

  // Helper to check if an item has zero cost (warning) - for both entrada and salida
  const hasZeroCostWarning = (itemId: string): boolean => {
    if (!itemId) return false

    const selectedItem = items.find((i) => i.id === itemId)
    const itemRefPrice = selectedItem?.costoPromedio ?? 0
    if (isCostReadonly) {
      // Don't show warning while costs are still loading
      if (isLoadingCosts) return false
      // For salida/transferencia: warning if both bodega cost AND item reference are 0
      const bodegaCost = averageCosts[itemId]?.costoPromedio ?? 0
      return bodegaCost <= 0 && itemRefPrice <= 0
    } else {
      // For entrada: warning if item has no reference price
      return itemRefPrice <= 0
    }
  }

  // Helper to check if an item has insufficient stock (warning for salida/transferencia)
  const getStockWarning = (itemId: string, cantidad: number): string | null => {
    if (!isCostReadonly || !itemId || !averageCosts[itemId]) {
      return null
    }
    const available = averageCosts[itemId].cantidad
    if (cantidad > available) {
      return `Stock insuficiente: disponible ${formatNumber(available, 2)}`
    }
    return null
  }

  // Helper to check if stock will fall below minimum after movement (warning for salida/transferencia)
  const getMinStockWarning = (itemId: string, cantidad: number): string | null => {
    if (!isCostReadonly || !itemId || !averageCosts[itemId]) {
      return null
    }
    const { cantidad: stockActual, stockMinimo } = averageCosts[itemId]
    // Skip if no minimum configured or insufficient stock (that's a separate error)
    if (stockMinimo == null || stockMinimo <= 0 || cantidad > stockActual) {
      return null
    }
    const stockResultante = stockActual - cantidad
    if (stockResultante < stockMinimo) {
      return `Stock quedará bajo el mínimo (${formatNumber(stockMinimo, 2)}). Resultante: ${formatNumber(stockResultante, 2)}`
    }
    return null
  }

  // Check if any detail has insufficient stock
  const hasStockWarnings = useMemo(() => {
    if (!isCostReadonly) return false
    return values.detalles.some((d) => {
      if (!d.itemId || !averageCosts[d.itemId]) return false
      return d.cantidad > averageCosts[d.itemId].cantidad
    })
  }, [values.detalles, averageCosts, isCostReadonly])

  // Check if any detail will cause stock to fall below minimum
  const hasMinStockWarnings = useMemo(() => {
    if (!isCostReadonly) return false
    return values.detalles.some((d) => {
      if (!d.itemId || !averageCosts[d.itemId]) return false
      const { cantidad: stockActual, stockMinimo } = averageCosts[d.itemId]
      if (stockMinimo == null || stockMinimo <= 0 || d.cantidad > stockActual) return false
      return (stockActual - d.cantidad) < stockMinimo
    })
  }, [values.detalles, averageCosts, isCostReadonly])

  return (
    <form
      className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      {/* Header Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="tipo">Tipo de Movimiento</Label>
          <select
            id="tipo"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
            value={values.tipo}
            onChange={(e) => handleTipoChange(e.target.value as MovementType)}
          >
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="fecha">Fecha</Label>
          <Input
            id="fecha"
            type="date"
            value={values.fecha}
            onChange={(e) => handleChange("fecha", e.target.value)}
            aria-invalid={Boolean(errors.fecha)}
          />
          {errors.fecha ? (
            <span className="text-sm text-destructive">{errors.fecha}</span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="terceroId">Tercero Relacionado</Label>
          <select
            id="terceroId"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
            value={values.terceroId ?? ""}
            onChange={(e) => handleChange("terceroId", e.target.value || null)}
          >
            <option value="">Sin tercero</option>
            {terceros.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} ({t.tipo})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bodegas Section - Conditional */}
      <div className="grid gap-4 md:grid-cols-2">
        {showBodegaOrigen ? (
          <div className="flex flex-col gap-1">
            <Label htmlFor="bodegaOrigenId">Bodega Origen</Label>
            <select
              id="bodegaOrigenId"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
              value={values.bodegaOrigenId ?? ""}
              onChange={(e) => handleChange("bodegaOrigenId", e.target.value || null)}
              aria-invalid={Boolean(errors.bodegaOrigenId)}
            >
              <option value="">Seleccione bodega origen</option>
              {bodegas.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre} ({b.identificacion})
                </option>
              ))}
            </select>
            {errors.bodegaOrigenId ? (
              <span className="text-sm text-destructive">{errors.bodegaOrigenId}</span>
            ) : null}
          </div>
        ) : null}

        {showBodegaDestino ? (
          <div className="flex flex-col gap-1">
            <Label htmlFor="bodegaDestinoId">Bodega Destino</Label>
            <select
              id="bodegaDestinoId"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
              value={values.bodegaDestinoId ?? ""}
              onChange={(e) => handleChange("bodegaDestinoId", e.target.value || null)}
              aria-invalid={Boolean(errors.bodegaDestinoId)}
            >
              <option value="">Seleccione bodega destino</option>
              {bodegas.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre} ({b.identificacion})
                </option>
              ))}
            </select>
            {errors.bodegaDestinoId ? (
              <span className="text-sm text-destructive">{errors.bodegaDestinoId}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Reference Document and Notes */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="documentoReferencia">Documento de Referencia</Label>
          <Input
            id="documentoReferencia"
            placeholder="Ej: FAC-001, OC-123"
            value={values.documentoReferencia}
            onChange={(e) => handleChange("documentoReferencia", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="observacion">Observaciones</Label>
          <Textarea
            id="observacion"
            placeholder="Notas adicionales..."
            value={values.observacion}
            onChange={(e) => handleChange("observacion", e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* Stock Warning Alert */}
      {hasStockWarnings && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <IconAlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <span className="font-medium">Advertencia de stock insuficiente:</span>{" "}
            Algunos ítems exceden el stock disponible. El movimiento puede guardarse como borrador, pero no podrá publicarse hasta que se ajusten las cantidades.
          </div>
        </div>
      )}

      {/* Minimum Stock Warning Alert */}
      {hasMinStockWarnings && !hasStockWarnings && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <IconAlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <span className="font-medium">Advertencia de stock mínimo:</span>{" "}
            Algunos ítems quedarán por debajo del stock mínimo configurado después de este movimiento.
          </div>
        </div>
      )}

      {/* Detail Lines Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Items del Movimiento</Label>
          <Button type="button" variant="outline" size="sm" onClick={addDetailLine}>
            <IconPlus className="mr-1 h-4 w-4" />
            Agregar Item
          </Button>
        </div>

        {errors.detalles ? (
          <span className="text-sm text-destructive">{errors.detalles}</span>
        ) : null}

        <div className="rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Item</th>
                <th className="w-28 px-3 py-2 text-left font-medium">Cantidad</th>
                <th className="w-32 px-3 py-2 text-left font-medium">
                  <div className="flex items-center gap-1">
                    Costo Unit.
                    {isCostReadonly && (
                      <span className="flex items-center gap-0.5 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-normal text-blue-700">
                        <IconLock className="h-3 w-3" />
                        Auto
                      </span>
                    )}
                  </div>
                </th>
                <th className="w-32 px-3 py-2 text-right font-medium">Total</th>
                <th className="w-12 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {values.detalles.map((detalle, index) => (


                <tr key={index}>

                  <td className="px-3 py-2">
                    <select
                      className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border bg-transparent px-2 text-sm outline-none"
                      value={detalle.itemId}
                      onChange={(e) => handleDetailChange(index, "itemId", e.target.value)}
                      aria-invalid={Boolean(errors[`detalles.${index}.itemId`])}
                    >
                      <option value="">Seleccione item</option>
                      {items.map((item) => {
                        const isDisabled = isItemAlreadySelected(item.id, index)
                        return (
                          <option
                            key={item.id}
                            value={item.id}
                            disabled={isDisabled}
                          >
                            {item.codigo} - {item.nombre}{isDisabled ? " (ya agregado)" : ""}
                          </option>
                        )
                      })}
                    </select>
                    {errors[`detalles.${index}.itemId`] ? (
                      <span className="text-xs text-destructive">
                        {errors[`detalles.${index}.itemId`]}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        className="h-8"
                        value={detalle.cantidad}
                        onChange={(e) => handleDetailChange(index, "cantidad", Number(e.target.value))}
                        aria-invalid={Boolean(errors[`detalles.${index}.cantidad`] || getStockWarning(detalle.itemId, detalle.cantidad))}
                      />
                      {errors[`detalles.${index}.cantidad`] ? (
                        <span className="text-xs text-destructive">
                          {errors[`detalles.${index}.cantidad`]}
                        </span>
                      ) : null}
                      {!errors[`detalles.${index}.cantidad`] && getStockWarning(detalle.itemId, detalle.cantidad) && (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <IconAlertTriangle className="h-3 w-3" />
                          {getStockWarning(detalle.itemId, detalle.cantidad)}
                        </span>
                      )}
                      {!errors[`detalles.${index}.cantidad`] && !getStockWarning(detalle.itemId, detalle.cantidad) && getMinStockWarning(detalle.itemId, detalle.cantidad) && (
                        <span className="flex items-center gap-1 text-xs text-blue-600">
                          <IconAlertTriangle className="h-3 w-3" />
                          {getMinStockWarning(detalle.itemId, detalle.cantidad)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className={`h-8 ${isCostReadonly ? "bg-neutral-100 pr-8" : ""}`}
                          value={detalle.costoUnitario}
                          onChange={(e) => handleDetailChange(index, "costoUnitario", Number(e.target.value))}
                          readOnly={isCostReadonly}
                          disabled={isCostReadonly && isLoadingCosts}
                          title={isCostReadonly ? "Costo calculado automáticamente desde el promedio ponderado" : undefined}
                        />
                        {isCostReadonly && (
                          isLoadingCosts ? (
                            <IconLoader className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
                          ) : (
                            <IconLock className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                          )
                        )}
                      </div>
                      {hasZeroCostWarning(detalle.itemId) && (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <IconAlertTriangle className="h-3 w-3" />
                          Sin precio de referencia
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {formatCurrency(calculateLineTotal(detalle.cantidad, detalle.costoUnitario))}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => removeDetailLine(index)}
                      disabled={values.detalles.length <= 1}
                    >
                      <IconTrash className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-50">
              <tr>
                <td colSpan={3} className="px-3 py-2 text-right font-medium">
                  Total Estimado:
                </td>
                <td className="px-3 py-2 text-right font-bold">
                  {formatCurrency(calculateGrandTotal())}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Form Error */}
      {errors.form ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.form}
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Movimiento"}
        </Button>
      </div>
    </form>
  )
}
