import Link from "next/link"

import type { BodegaDetail } from "@/lib/types/bodegas"
import { Button } from "@/components/ui/button"

type WarehouseDetailHeaderProps = {
  bodega: BodegaDetail
  canEdit?: boolean
}

export function WarehouseDetailHeader({
  bodega,
  canEdit = false,
}: WarehouseDetailHeaderProps) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Maestros</p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Detalle de bodega
          </h1>
          <p className="text-sm text-neutral-600">
            {bodega.nombre}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/warehouses">Volver</Link>
          </Button>
          {canEdit ? (
            <Button asChild>
              <Link href={`/warehouses/${bodega.id}/edit`}>Editar</Link>
            </Button>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold text-neutral-500">Identificacion</p>
          <p className="text-sm text-neutral-800">{bodega.identificacion}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-500">Ubicacion</p>
          <p className="text-sm text-neutral-800">{bodega.ubicacion ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-500">Estado</p>
          <p className="text-sm capitalize text-neutral-800">{bodega.estado}</p>
        </div>
      </div>

      {bodega.estado === "inactivo" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Esta bodega esta inactiva y no permite nuevas asignaciones.
        </div>
      ) : null}
    </section>
  )
}
