import Link from "next/link"

import { getMovementById } from "@/lib/data/movements"
import { getAuthSession } from "@/lib/auth/session"
import { hasPermission } from "@/lib/auth/guards"
import { MovementDeleteModal } from "@/components/movements/movement-delete-modal"
import { MovementActionButtons } from "@/components/movements/movement-action-buttons"
import { MovementStatusBadge } from "@/components/movements/movement-status-badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { MovementStatus } from "@/components/movements/movement-status-badge"

type MovementDetailPageProps = {
  params: Promise<{ id: string }>
}

const dateFormatter = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
})

const dateTimeFormatter = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
  timeStyle: "short",
})

const tipoLabels: Record<string, string> = {
  entrada: "Entrada",
  salida: "Salida",
  transferencia: "Transferencia",
}


export default async function MovementDetailPage({ params }: MovementDetailPageProps) {
  const { id } = await params
  const movement = await getMovementById(id)

  const session = await getAuthSession()
  const role = session?.user?.role
  const canWrite = hasPermission(role, "movements:write")
  const isBorrador = movement?.estado === "borrador"
  const canEdit = canWrite && isBorrador
  const canDelete = canWrite && isBorrador

  if (!movement) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-neutral-900">
            Movimiento no encontrado
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            El movimiento que buscas no existe o fue eliminado.
          </p>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/movements">Volver a movimientos</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Inventario</p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-neutral-900">
              {tipoLabels[movement.tipo] ?? movement.tipo}
            </h1>
            <MovementStatusBadge status={movement.estado as MovementStatus} size="md" />
          </div>
          <p className="text-sm text-neutral-600">
            {dateFormatter.format(movement.fecha)}
          </p>
        </div>
        <div className="flex gap-2">
          {canWrite && (
            <MovementActionButtons
              movementId={movement.id}
              estado={movement.estado as MovementStatus}
            />
          )}
          {canEdit ? (
            <Button asChild>
              <Link href={`/movements/${movement.id}/edit`}>Editar</Link>
            </Button>
          ) : null}
          {canDelete ? (
            <MovementDeleteModal
              movementId={movement.id}
              movementLabel={`${tipoLabels[movement.tipo] ?? movement.tipo} - ${dateFormatter.format(movement.fecha)}`}
              trigger={
                <Button variant="destructive">Eliminar</Button>
              }
            />
          ) : null}
          <Button asChild variant="outline">
            <Link href="/movements">Volver</Link>
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        {/* Movement Info */}
        <div className="grid gap-4 text-sm md:grid-cols-3">
          {movement.bodegaOrigen ? (
            <div>
              <span className="text-xs uppercase text-neutral-400">Bodega Origen</span>
              <p className="text-base font-medium text-neutral-900">
                {movement.bodegaOrigen.nombre}
              </p>
            </div>
          ) : null}
          {movement.bodegaDestino ? (
            <div>
              <span className="text-xs uppercase text-neutral-400">Bodega Destino</span>
              <p className="text-base font-medium text-neutral-900">
                {movement.bodegaDestino.nombre}
              </p>
            </div>
          ) : null}
          {movement.tercero ? (
            <div>
              <span className="text-xs uppercase text-neutral-400">Tercero Relacionado</span>
              <p className="text-base font-medium text-neutral-900">
                {movement.tercero.nombre}
              </p>
            </div>
          ) : null}
          {movement.documentoReferencia ? (
            <div>
              <span className="text-xs uppercase text-neutral-400">Documento Referencia</span>
              <p className="text-sm text-neutral-900">
                {movement.documentoReferencia}
              </p>
            </div>
          ) : null}
          <div>
            <span className="text-xs uppercase text-neutral-400">Creado por</span>
            <p className="text-sm text-neutral-900">
              {movement.usuario.name}
            </p>
          </div>
          <div>
            <span className="text-xs uppercase text-neutral-400">Creado</span>
            <p className="text-sm text-neutral-900">
              {dateTimeFormatter.format(movement.creadoEn)}
            </p>
          </div>
          {movement.observacion ? (
            <div className="md:col-span-3">
              <span className="text-xs uppercase text-neutral-400">Observaciones</span>
              <p className="text-sm text-neutral-900">
                {movement.observacion}
              </p>
            </div>
          ) : null}
        </div>

        {/* Detail Lines */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-neutral-700">Items del Movimiento</h3>
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600">Item</th>
                  <th className="w-28 px-4 py-2 text-right font-medium text-neutral-600">Cantidad</th>
                  <th className="w-32 px-4 py-2 text-right font-medium text-neutral-600">Costo Unit.</th>
                  <th className="w-36 px-4 py-2 text-right font-medium text-neutral-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {movement.detalles.map((detalle) => (
                  <tr key={detalle.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">{detalle.item.nombre}</div>
                      <div className="text-xs text-neutral-500">{detalle.item.codigo}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-700">
                      {detalle.cantidad}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-700">
                      {detalle.costoUnitario != null
                        ? formatCurrency(detalle.costoUnitario)
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-neutral-900">
                      {detalle.costoTotal != null
                        ? formatCurrency(detalle.costoTotal)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-neutral-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-medium text-neutral-700">
                    Total Estimado:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-neutral-900">
                    {formatCurrency(movement.totalEstimado)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
