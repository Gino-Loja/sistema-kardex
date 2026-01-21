import Link from "next/link"
import type { SearchParams } from "nuqs/server"

import { listItems } from "@/lib/data/items"
import { getAuthSession } from "@/lib/auth/session"
import { hasPermission } from "@/lib/auth/guards"
import { itemListQuerySchema } from "@/lib/validators/item"
import { ItemFilters } from "@/components/items/item-filters"
import { ItemListTable } from "@/components/items/item-list-table"
import { Button } from "@/components/ui/button"
import { loadItemsSearchParams } from "./search-params"

type ItemsPageProps = {
  searchParams: Promise<SearchParams>
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const resolvedSearchParams = await loadItemsSearchParams(searchParams)
  const rawQuery = {
    page: resolvedSearchParams.page,
    pageSize: resolvedSearchParams.pageSize,
    search: resolvedSearchParams.search ?? undefined,
    status: resolvedSearchParams.status ?? undefined,
    dateFrom: resolvedSearchParams.dateFrom ?? undefined,
    dateTo: resolvedSearchParams.dateTo ?? undefined,
  }

  const parsed = itemListQuerySchema.safeParse(rawQuery)
  const query = parsed.success ? parsed.data : { page: 1, pageSize: 20 }

  const { items, total, page, pageSize } = await listItems(query)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = Boolean(
    rawQuery.search || rawQuery.status || rawQuery.dateFrom || rawQuery.dateTo,
  )
  const session = await getAuthSession()
  const role = session?.user?.role
  const canReadItems = hasPermission(role, "masters:read")
  const canWriteItems = hasPermission(role, "masters:write")

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams()

    if (rawQuery.search) params.set("search", rawQuery.search)
    if (rawQuery.status) params.set("status", rawQuery.status)
    if (rawQuery.dateFrom) params.set("dateFrom", rawQuery.dateFrom)
    if (rawQuery.dateTo) params.set("dateTo", rawQuery.dateTo)
    if (rawQuery.pageSize) params.set("pageSize", String(rawQuery.pageSize))
    params.set("page", String(nextPage))

    return `/items?${params.toString()}`
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-neutral-500">
              Maestros
            </p>
            <h1 className="text-3xl font-semibold text-neutral-900">Items</h1>
            <p className="text-sm text-neutral-600">
              Catalogo de productos y servicios con estado operativo.
            </p>
          </div>
          <Button asChild>
            <Link href="/items/create">Nuevo item</Link>
          </Button>
        </div>
        <ItemFilters />
      </header>

      <section className="flex flex-col gap-3">
        <ItemListTable
          items={items}
          canRead={canReadItems}
          canWrite={canWriteItems}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500">
          <span>
            Mostrando pagina {page} de {totalPages} · {total} items
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

