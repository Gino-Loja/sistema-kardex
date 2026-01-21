import Link from "next/link"

import type { Categoria } from "@/lib/dal/repositories/categorias.repository"
import { CategoryActionsMenu } from "@/components/categories/category-actions-menu"

type CategoryListTableProps = {
  items: Categoria[]
  canWrite?: boolean
}

export function CategoryListTable({
  items,
  canWrite = false,
}: CategoryListTableProps) {
  const canShowActions = canWrite

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="grid grid-cols-[1fr_2fr_120px_80px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-500">
        <span>Nombre</span>
        <span>Descripcion</span>
        <span>Estado</span>
        <span className="text-right">Accion</span>
      </div>
      <div className="divide-y divide-neutral-100">
        {items.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-neutral-500">
            Aun no hay categorias registradas.
          </div>
        ) : (
          items.map((categoria) => (
            <div
              key={categoria.id}
              className="grid grid-cols-[1fr_2fr_120px_80px] gap-4 px-4 py-3 text-sm text-neutral-700"
            >
              <Link
                href={`/categories/${categoria.id}`}
                className="font-medium text-neutral-900 hover:underline"
              >
                {categoria.nombre}
              </Link>
              <span className="text-neutral-600">
                {categoria.descripcion?.trim() ? categoria.descripcion : "Sin descripcion"}
              </span>
              <span className="capitalize text-neutral-600">
                {categoria.estado}
              </span>
              <div className="text-right">
                {canShowActions ? (
                  <CategoryActionsMenu
                    categoryId={categoria.id}
                    categoryLabel={categoria.nombre}
                    canWrite={canWrite}
                  />
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
