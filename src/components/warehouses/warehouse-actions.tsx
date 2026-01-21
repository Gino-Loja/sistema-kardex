"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { WarehouseDeleteModal } from "@/components/warehouses/warehouse-delete-modal"

type WarehouseActionsProps = {
  bodegaId: string
  bodegaLabel: string
  canWrite?: boolean
}

export function WarehouseActions({
  bodegaId,
  bodegaLabel,
  canWrite = false,
}: WarehouseActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/warehouses/${bodegaId}`}>Gestionar</Link>
      </Button>
      {canWrite ? (
        <WarehouseDeleteModal
          bodegaId={bodegaId}
          bodegaLabel={bodegaLabel}
          trigger={(
            <Button variant="destructive" size="sm">
              Eliminar
            </Button>
          )}
        />
      ) : null}
    </div>
  )
}
