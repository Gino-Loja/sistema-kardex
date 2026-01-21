import Link from "next/link"

import { listBodegas } from "@/lib/data/bodegas"
import { getAuthSession } from "@/lib/auth/session"
import { hasRole } from "@/lib/auth/guards"
import { Button } from "@/components/ui/button"
import { WarehouseActions } from "@/components/warehouses/warehouse-actions"

export default async function WarehousesPage() {
  const { items } = await listBodegas({ page: 1, pageSize: 20 })
  const session = await getAuthSession()
  const role = session?.user?.role
  const canWrite = hasRole(role, "admin")

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">
            Maestros
          </p>
          <h1 className="text-3xl font-semibold text-neutral-900">Bodegas</h1>
          <p className="text-sm text-neutral-600">
            Ubicaciones disponibles para la gestion de inventario.
          </p>
        </div>
        {canWrite ? (
          <Button asChild>
            <Link href="/warehouses/create">Crear bodega</Link>
          </Button>
        ) : null}
      </header>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="grid grid-cols-[160px_1fr_1fr_120px_180px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-500">
          <span>Identificacion</span>
          <span>Nombre</span>
          <span>Ubicacion</span>
          <span>Estado</span>
          <span className="text-right">Accion</span>
        </div>
        <div className="divide-y divide-neutral-100">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-neutral-500">
              Aun no hay bodegas registradas.
            </div>
          ) : (
            items.map((bodega) => (
              <div
                key={bodega.id}
                className="grid grid-cols-[160px_1fr_1fr_120px_180px] gap-4 px-4 py-3 text-sm text-neutral-700"
              >
                <Link
                  href={`/warehouses/${bodega.id}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {bodega.identificacion}
                </Link>
                <span className="text-neutral-600">{bodega.nombre}</span>
                <span className="text-neutral-600">
                  {bodega.ubicacion ?? "-"}
                </span>
                <span className="capitalize text-neutral-600">
                  {bodega.estado}
                </span>
                <WarehouseActions
                  bodegaId={bodega.id}
                  bodegaLabel={bodega.nombre}
                  canWrite={canWrite}
                />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

