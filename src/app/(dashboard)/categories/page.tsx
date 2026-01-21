import Link from "next/link"
import type { SearchParams } from "nuqs/server"

import { CategoryListTable } from "@/components/categories/category-list-table"
import { listCategorias } from "@/lib/data/categorias"
import { getAuthSession } from "@/lib/auth/session"
import { hasPermission } from "@/lib/auth/guards"
import { Button } from "@/components/ui/button"

type CategoriesPageProps = {
  searchParams: Promise<SearchParams>
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const resolvedSearchParams = await searchParams
  const deletedFlag = resolvedSearchParams?.deleted
  const showDeletedBanner = deletedFlag === "1"

  const { items } = await listCategorias({ page: 1, pageSize: 1000 })
  const session = await getAuthSession()
  const role = session?.user?.role
  const canWriteCategories = hasPermission(role, "masters:write")

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Maestros</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Categorias</h1>
          <p className="text-sm text-neutral-600">
            Organiza los items en categorias globales.
          </p>
        </div>
        <Button asChild>
          <Link href="/categories/create">Crear categoria</Link>
        </Button>
      </header>

      {showDeletedBanner ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Categoria eliminada correctamente.
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-8 text-center text-sm text-neutral-600">
          Aun no hay categorias. Crea la primera para organizar tus items.
        </div>
      ) : null}

      <CategoryListTable items={items} canWrite={canWriteCategories} />
    </div>
  )
}
