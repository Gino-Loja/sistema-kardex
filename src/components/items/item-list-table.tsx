import Link from "next/link"

import type { Item } from "@/lib/dal/repositories/items.repository"
import { ItemActionsMenu } from "@/components/items/item-actions-menu"

type ItemListTableProps = {
  items: Item[]
  canRead?: boolean
  canWrite?: boolean
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function ItemListTable({
  items,
  canRead = false,
  canWrite = false,
}: ItemListTableProps) {
  const canShowActions = canRead || canWrite

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Vista móvil (cards) */}
      <div className="md:hidden">
        <div className="divide-y divide-neutral-100">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-neutral-500">
              Aun no hay items registrados.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 px-4 py-4 text-sm text-neutral-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold uppercase text-neutral-400">
                      {item.codigo}
                    </div>
                    {canRead ? (
                      <Link
                        href={`/items/${item.id}`}
                        className="truncate text-base font-medium text-neutral-900 hover:underline"
                      >
                        {item.nombre}
                      </Link>
                    ) : (
                      <div className="truncate text-base font-medium text-neutral-900">
                        {item.nombre}
                      </div>
                    )}
                  </div>
                  {canShowActions ? (
                    <ItemActionsMenu
                      itemId={item.id}
                      itemLabel={item.nombre}
                      canRead={canRead}
                      canWrite={canWrite}
                    />
                  ) : null}
                </div>
                <div className="grid gap-1 text-xs text-neutral-500">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex-shrink-0">Descripcion</span>
                    <span className="text-right text-neutral-700 break-words">
                      {item.descripcion}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Unidad</span>
                    <span className="text-right text-neutral-700">
                      {item.unidadMedida}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Estado</span>
                    <span className="capitalize text-right text-neutral-700">
                      {item.estado}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Creado</span>
                    <span className="text-right text-neutral-700">
                      {dateTimeFormatter.format(item.creadoEn)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Actualizado</span>
                    <span className="text-right text-neutral-700">
                      {dateTimeFormatter.format(item.actualizadoEn)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Vista escritorio (tabla con scroll horizontal) */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-[140px_160px_1fr_140px_120px_160px_160px_80px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-500">
            <span>Codigo</span>
            <span>Nombre</span>
            <span>Descripcion</span>
            <span>Unidad</span>
            <span>Estado</span>
            <span>Creado</span>
            <span>Actualizado</span>
            <span className="text-right">Accion</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-neutral-500">
                Aun no hay items registrados.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="grid grid-cols-[140px_160px_1fr_140px_120px_160px_160px_80px] gap-4 px-4 py-3 text-sm text-neutral-700">
                  <span className="font-medium text-neutral-900">
                    {item.codigo}
                  </span>
                  {canRead ? (
                    <Link
                      href={`/items/${item.id}`}
                      className="text-neutral-600 hover:underline"
                    >
                      {item.nombre}
                    </Link>
                  ) : (
                    <span className="text-neutral-600">{item.nombre}</span>
                  )}
                  <span className="text-neutral-600">{item.descripcion}</span>
                  <span className="text-neutral-600">{item.unidadMedida}</span>
                  <span className="capitalize text-neutral-600">{item.estado}</span>
                  <span className="text-neutral-600">
                    {dateTimeFormatter.format(item.creadoEn)}
                  </span>
                  <span className="text-neutral-600">
                    {dateTimeFormatter.format(item.actualizadoEn)}
                  </span>
                  <div className="text-right">
                    {canShowActions ? (
                      <ItemActionsMenu
                        itemId={item.id}
                        itemLabel={item.nombre}
                        canRead={canRead}
                        canWrite={canWrite}
                      />
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}