import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { getMovementById } from "@/lib/data/movements"
import { MovementForm } from "@/components/movements/movement-form"
import { Button } from "@/components/ui/button"

type MovementEditPageProps = {
  params: Promise<{
    id: string
  }>
}

const formatDateForInput = (date: Date) => {
  return date.toISOString().split("T")[0]
}

export default async function MovementEditPage({ params }: MovementEditPageProps) {
  const { id } = await params
  const movement = await getMovementById(id)

  if (!movement) {
    notFound()
  }

  // Block edit access if movement is not in borrador state
  if (movement.estado !== "borrador") {
    redirect(`/movements/${id}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Inventario</p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Editar Movimiento
          </h1>
          <p className="text-sm text-neutral-600">
            Modifica los datos del movimiento mientras esté en estado borrador.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/movements/${id}`}>Cancelar</Link>
        </Button>
      </header>

      <MovementForm
        mode="edit"
        movementId={movement.id}
        initialValues={{
          tipo: movement.tipo as "entrada" | "salida" | "transferencia",
          fecha: formatDateForInput(movement.fecha),
          bodegaOrigenId: movement.bodegaOrigen?.id ?? null,
          bodegaDestinoId: movement.bodegaDestino?.id ?? null,
          terceroId: movement.tercero?.id ?? null,
          documentoReferencia: movement.documentoReferencia ?? "",
          observacion: movement.observacion ?? "",
          detalles: movement.detalles.map((d) => ({
            itemId: d.item.id,
            cantidad: d.cantidad,
            costoUnitario: d.costoUnitario ?? 0,
          })),
        }}
      />
    </div>
  )
}
