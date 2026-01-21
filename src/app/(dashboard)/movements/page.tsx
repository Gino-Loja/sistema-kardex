import Link from "next/link"
import type { SearchParams } from "nuqs/server"

import { listMovements } from "@/lib/data/movements"
import { getAuthSession } from "@/lib/auth/session"
import { hasPermission } from "@/lib/auth/guards"
import { movementListQuerySchema } from "@/lib/validators/movement"
import { MovementListTable } from "@/components/movements/movement-list-table"
import { Button } from "@/components/ui/button"
import { loadMovementsSearchParams } from "./search-params"

type MovementsPageProps = {
  searchParams: Promise<SearchParams>
}

export default async function MovementsPage({ searchParams }: MovementsPageProps) {
  const resolvedSearchParams = await loadMovementsSearchParams(searchParams)
  const rawQuery = {
    page: resolvedSearchParams.page,
    pageSize: resolvedSearchParams.pageSize,
    tipo: resolvedSearchParams.tipo ?? undefined,
    estado: resolvedSearchParams.estado ?? undefined,
    fechaDesde: resolvedSearchParams.fechaDesde ?? undefined,
    fechaHasta: resolvedSearchParams.fechaHasta ?? undefined,
    search: resolvedSearchParams.search ?? undefined,
  }

  const parsed = movementListQuerySchema.safeParse(rawQuery)
  const query = parsed.success ? parsed.data : { page: 1, pageSize: 20 }

  const { items, total, page, pageSize } = await listMovements(query)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const session = await getAuthSession()
  const role = session?.user?.role
  const canReadMovements = hasPermission(role, "movements:read")
  const canWriteMovements = hasPermission(role, "movements:write")

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams()

    if (rawQuery.tipo) params.set("tipo", rawQuery.tipo)
    if (rawQuery.estado) params.set("estado", rawQuery.estado)
    if (rawQuery.fechaDesde) params.set("fechaDesde", rawQuery.fechaDesde)
    if (rawQuery.fechaHasta) params.set("fechaHasta", rawQuery.fechaHasta)
    if (rawQuery.search) params.set("search", rawQuery.search)
    if (rawQuery.pageSize) params.set("pageSize", String(rawQuery.pageSize))
    params.set("page", String(nextPage))

    return `/movements?${params.toString()}`
  }

  // Map data to table format
  const tableMovements = items.map((m) => ({
    id: m.id,
    tipo: m.tipo,
    estado: m.estado,
    fecha: m.fecha,
    bodegaOrigen: m.bodegaOrigen?.nombre ?? null,
    bodegaDestino: m.bodegaDestino?.nombre ?? null,
    tercero: m.tercero?.nombre ?? null,
    totalEstimado: m.totalEstimado,
    itemsCount: m.cantidadItems,
    creadoEn: m.fecha,
  }))

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-neutral-500">Inventario</p>
            <h1 className="text-3xl font-semibold text-neutral-900">Movimientos</h1>
            <p className="text-sm text-neutral-600">
              Historial de entradas, salidas y transferencias de inventario.
            </p>
          </div>
          {canWriteMovements ? (
            <Button asChild>
              <Link href="/movements/create">Nuevo Movimiento</Link>
            </Button>
          ) : null}
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <MovementListTable
          movements={tableMovements}
          canRead={canReadMovements}
          canWrite={canWriteMovements}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500">
          <span>
            Mostrando página {page} de {totalPages} · {total} movimientos
          </span>
          <div className="flex items-center gap-2">
            {page <= 1 ? (
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href={buildPageHref(page - 1)}>Anterior</Link>
              </Button>
            )}
            {page >= totalPages ? (
              <Button variant="outline" size="sm" disabled>
                Siguiente
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href={buildPageHref(page + 1)}>Siguiente</Link>
              </Button>
            )}
          </div>
        </div>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
            No hay movimientos registrados.
          </div>
        ) : null}
      </section>
    </div>
  )
}
