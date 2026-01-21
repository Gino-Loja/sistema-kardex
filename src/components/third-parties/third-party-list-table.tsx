import Link from "next/link"

import type { Tercero } from "@/lib/dal/repositories/terceros.repository"
import { ThirdPartyActionsMenu } from "@/components/third-parties/third-party-actions-menu"

type ThirdPartyListTableProps = {
  items: Tercero[]
  canRead?: boolean
  canWrite?: boolean
}

export function ThirdPartyListTable({
  items,
  canRead = false,
  canWrite = false,
}: ThirdPartyListTableProps) {
  const canShowActions = canRead || canWrite

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Vista movil (cards) */}
      <div className="md:hidden">
        <div className="divide-y divide-neutral-100">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-neutral-500">
              Aun no hay terceros registrados.
            </div>
          ) : (
            items.map((tercero) => (
              <div key={tercero.id} className="flex flex-col gap-3 px-4 py-4 text-sm text-neutral-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold uppercase text-neutral-400">
                      {tercero.tipo}
                    </div>
                    {canRead ? (
                      <Link
                        href={`/third-parties/${tercero.id}`}
                        className="truncate text-base font-medium text-neutral-900 hover:underline"
                      >
                        {tercero.nombre}
                      </Link>
                    ) : (
                      <div className="truncate text-base font-medium text-neutral-900">
                        {tercero.nombre}
                      </div>
                    )}
                  </div>
                  {canShowActions ? (
                    <ThirdPartyActionsMenu
                      terceroId={tercero.id}
                      terceroLabel={tercero.nombre}
                      canRead={canRead}
                      canWrite={canWrite}
                    />
                  ) : null}
                </div>
                <div className="grid gap-1 text-xs text-neutral-500">
                  <div className="flex items-center justify-between gap-4">
                    <span>Identificacion</span>
                    <span className="text-right text-neutral-700">
                      {tercero.identificacion}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Estado</span>
                    <span className="capitalize text-right text-neutral-700">
                      {tercero.estado}
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
          <div className="grid grid-cols-[140px_180px_1fr_120px_80px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-500">
            <span>Tipo</span>
            <span>Identificacion</span>
            <span>Nombre</span>
            <span>Estado</span>
            <span className="text-right">Accion</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-neutral-500">
                Aun no hay terceros registrados.
              </div>
            ) : (
              items.map((tercero) => (
                <div key={tercero.id} className="grid grid-cols-[140px_180px_1fr_120px_80px] gap-4 px-4 py-3 text-sm text-neutral-700">
                  <span className="capitalize font-medium text-neutral-900">
                    {tercero.tipo}
                  </span>
                  <span className="text-neutral-600">
                    {tercero.identificacion}
                  </span>
                  {canRead ? (
                    <Link
                      href={`/third-parties/${tercero.id}`}
                      className="text-neutral-600 hover:underline"
                    >
                      {tercero.nombre}
                    </Link>
                  ) : (
                    <span className="text-neutral-600">{tercero.nombre}</span>
                  )}
                  <span className="capitalize text-neutral-600">
                    {tercero.estado}
                  </span>
                  <div className="text-right">
                    {canShowActions ? (
                      <ThirdPartyActionsMenu
                        terceroId={tercero.id}
                        terceroLabel={tercero.nombre}
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
