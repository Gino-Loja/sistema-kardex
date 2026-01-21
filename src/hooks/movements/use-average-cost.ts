"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import type { AverageCostItem } from "@/lib/types/movements"

interface UseAverageCostOptions {
  bodegaId: string | null | undefined
  itemIds: string[]
  enabled?: boolean
}

interface UseAverageCostResult {
  costs: Record<string, AverageCostItem>
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener los costos promedio de múltiples ítems en una bodega.
 * Útil para movimientos de salida donde el costo se calcula automáticamente.
 */
export function useAverageCost({
  bodegaId,
  itemIds,
  enabled = true,
}: UseAverageCostOptions): UseAverageCostResult {
  const [costs, setCosts] = useState<Record<string, AverageCostItem>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchCosts = useCallback(async () => {
    if (!enabled || !bodegaId || itemIds.length === 0) {
      setCosts({})
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    const uniqueIds = [...new Set(itemIds)]

    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        bodegaId,
        itemIds: uniqueIds.join(","),
      })

      const response = await fetch(`/api/item-bodegas/average-costs?${params}`, {
        signal,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error?.message ?? "Error al obtener costos promedio")
      }

      const data = await response.json()

      if (data.success && data.data?.costs) {
        setCosts(data.data.costs)
      } else {
        setCosts({})
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return
      }
      setError(err instanceof Error ? err.message : "Error desconocido")
      setCosts({})
    } finally {
      setIsLoading(false)
    }
  }, [bodegaId, itemIds, enabled])

  useEffect(() => {
    void fetchCosts()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchCosts])

  return {
    costs,
    isLoading,
    error,
    refetch: fetchCosts,
  }
}

/**
 * Obtiene el costo promedio de un solo ítem.
 * Wrapper de conveniencia sobre useAverageCost.
 */
export function useItemAverageCost(
  bodegaId: string | null | undefined,
  itemId: string | null | undefined
): {
  cost: AverageCostItem | null
  isLoading: boolean
  error: string | null
} {
  const { costs, isLoading, error } = useAverageCost({
    bodegaId,
    itemIds: itemId ? [itemId] : [],
    enabled: Boolean(bodegaId && itemId),
  })

  return {
    cost: itemId ? costs[itemId] ?? null : null,
    isLoading,
    error,
  }
}
