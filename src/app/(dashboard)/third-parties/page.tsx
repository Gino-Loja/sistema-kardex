import Link from "next/link"
import type { SearchParams } from "nuqs/server"

import { listTerceros } from "@/lib/data/terceros"
import { getAuthSession } from "@/lib/auth/session"
import { hasPermission, hasRole } from "@/lib/auth/guards"
import { terceroListQuerySchema } from "@/lib/validators/tercero"
import { ThirdPartyFilters } from "@/components/third-parties/third-party-filters"
import { ThirdPartyListTable } from "@/components/third-parties/third-party-list-table"
import { Button } from "@/components/ui/button"
import { loadThirdPartiesSearchParams } from "./search-params"

type ThirdPartiesPageProps = {
  searchParams: Promise<SearchParams>
}

export default async function ThirdPartiesPage({ searchParams }: ThirdPartiesPageProps) {
  const resolvedSearchParams = await loadThirdPartiesSearchParams(searchParams)
  const rawQuery = {
    page: resolvedSearchParams.page,
    pageSize: resolvedSearchParams.pageSize,
    search: resolvedSearchParams.search ?? undefined,
    estado: resolvedSearchParams.estado ?? undefined,
    tipo: resolvedSearchParams.tipo ?? undefined,
  }

  const parsed = terceroListQuerySchema.safeParse(rawQuery)
  const query = parsed.success ? parsed.data : { page: 1, pageSize: 20 }

  const { items, total, page, pageSize } = await listTerceros(query)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = Boolean(
    rawQuery.search ||
      rawQuery.tipo ||
      (rawQuery.estado && rawQuery.estado !== "activo"),
  )
  const session = await getAuthSession()
  const role = session?.user?.role
  const canReadTerceros = hasPermission(role, "masters:read")
  const canWriteTerceros = hasRole(role, "admin")

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams()

    if (rawQuery.search) params.set("search", rawQuery.search)
    if (rawQuery.estado) params.set("estado", rawQuery.estado)
    if (rawQuery.tipo) params.set("tipo", rawQuery.tipo)
    if (rawQuery.pageSize) params.set("pageSize", String(rawQuery.pageSize))
    params.set("page", String(nextPage))

    return `/third-parties?${params.toString()}`
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">
            Maestros
          </p>
          <h1 className="text-3xl font-semibold text-neutral-900">Terceros</h1>
          <p className="text-sm text-neutral-600">
            Clientes y proveedores con historial de movimientos.
          </p>
        </div>
        {canWriteTerceros ? (
          <Button asChild>
            <Link href="/third-parties/create">Nuevo tercero</Link>
          </Button>
        ) : null}
      </header>

      <section className="flex flex-col gap-3">
        <ThirdPartyFilters />
        <ThirdPartyListTable
          items={items}
          canRead={canReadTerceros}
          canWrite={canWriteTerceros}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500">
          <span>
            Mostrando pagina {page} de {totalPages} y {total} terceros
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
        {items.length === 0 && hasFilters ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
            No hay resultados con los filtros actuales.
          </div>
        ) : null}
      </section>
    </div>
  )
}
