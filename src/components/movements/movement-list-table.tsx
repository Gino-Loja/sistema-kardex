import { MovementActionsMenu } from "@/components/movements/movement-actions-menu"
import { MovementStatusBadge, type MovementStatus } from "@/components/movements/movement-status-badge"
import { formatCurrency } from "@/lib/utils"

type Movement = {
  id: string
  tipo: string
  estado: string
  fecha: Date
  bodegaOrigen: string | null
  bodegaDestino: string | null
  tercero: string | null
  totalEstimado: number
  itemsCount: number
  creadoEn: Date
}

type MovementListTableProps = {
  movements: Movement[]
  canRead?: boolean
  canWrite?: boolean
}

const dateFormatter = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
})

const tipoLabels: Record<string, string> = {
  entrada: "Entrada",
  salida: "Salida",
  transferencia: "Transferencia",
}


export function MovementListTable({
  movements,
  canRead = false,
  canWrite = false,
}: MovementListTableProps) {
  const canShowActions = canRead || canWrite

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Vista móvil (cards) */}
      <div className="md:hidden">
        <div className="divide-y divide-neutral-100">
          {movements.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-neutral-500">
              Aún no hay movimientos registrados.
            </div>
          ) : (
            movements.map((movement) => (
              <div key={movement.id} className="flex flex-col gap-3 px-4 py-4 text-sm text-neutral-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900">
                        {tipoLabels[movement.tipo] ?? movement.tipo}
                      </span>
                      <MovementStatusBadge status={movement.estado as MovementStatus} size="sm" />
                    </div>
                    <div className="text-xs text-neutral-500">
                      {dateFormatter.format(movement.fecha)}
                    </div>
                  </div>
                  {canShowActions ? (
                    <MovementActionsMenu
                      movementId={movement.id}
                      movementLabel={`${tipoLabels[movement.tipo] ?? movement.tipo} - ${dateFormatter.format(movement.fecha)}`}
                      estado={movement.estado}
                      canRead={canRead}
                      canWrite={canWrite}
                    />
                  ) : null}
                </div>
                <div className="grid gap-1 text-xs text-neutral-500">
                  {movement.bodegaOrigen ? (
                    <div className="flex items-center justify-between gap-4">
                      <span>Bodega Origen</span>
                      <span className="text-right text-neutral-700">
                        {movement.bodegaOrigen}
                      </span>
                    </div>
                  ) : null}
                  {movement.bodegaDestino ? (
                    <div className="flex items-center justify-between gap-4">
                      <span>Bodega Destino</span>
                      <span className="text-right text-neutral-700">
                        {movement.bodegaDestino}
                      </span>
                    </div>
                  ) : null}
                  {movement.tercero ? (
                    <div className="flex items-center justify-between gap-4">
                      <span>Tercero</span>
                      <span className="text-right text-neutral-700">
                        {movement.tercero}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-4">
                    <span>Items</span>
                    <span className="text-right text-neutral-700">
                      {movement.itemsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Total</span>
                    <span className="text-right font-medium text-neutral-900">
                      {formatCurrency(movement.totalEstimado)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Vista escritorio (tabla) */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-[100px_100px_120px_180px_180px_180px_80px_140px_80px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-500">
            <span>Tipo</span>
            <span>Estado</span>
            <span>Fecha</span>
            <span>Bodega Origen</span>
            <span>Bodega Destino</span>
            <span>Tercero</span>
            <span className="text-center">Items</span>
            <span className="text-right">Total</span>
            <span className="text-right">Acción</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {movements.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-neutral-500">
                Aún no hay movimientos registrados.
              </div>
            ) : (
              movements.map((movement) => (
                <div key={movement.id} className="grid grid-cols-[100px_100px_120px_180px_180px_180px_80px_140px_80px] gap-4 px-4 py-3 text-sm text-neutral-700">
                  <span className="font-medium text-neutral-900">
                    {tipoLabels[movement.tipo] ?? movement.tipo}
                  </span>
                  <span>
                    <MovementStatusBadge status={movement.estado as MovementStatus} size="sm" />
                  </span>
                  <span className="text-neutral-600">
                    {dateFormatter.format(movement.fecha)}
                  </span>
                  <span className="text-neutral-600 truncate">
                    {movement.bodegaOrigen ?? "-"}
                  </span>
                  <span className="text-neutral-600 truncate">
                    {movement.bodegaDestino ?? "-"}
                  </span>
                  <span className="text-neutral-600 truncate">
                    {movement.tercero ?? "-"}
                  </span>
                  <span className="text-center text-neutral-600">
                    {movement.itemsCount}
                  </span>
                  <span className="text-right font-medium text-neutral-900">
                    {formatCurrency(movement.totalEstimado)}
                  </span>
                  <div className="text-right">
                    {canShowActions ? (
                      <MovementActionsMenu
                        movementId={movement.id}
                        movementLabel={`${tipoLabels[movement.tipo] ?? movement.tipo} - ${dateFormatter.format(movement.fecha)}`}
                        estado={movement.estado}
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
