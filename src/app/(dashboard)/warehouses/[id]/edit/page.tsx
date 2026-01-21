import Link from "next/link"
import { notFound } from "next/navigation"

import { getBodegaById } from "@/lib/data/bodegas"
import { WarehouseForm } from "@/components/warehouses/warehouse-form"
import { Button } from "@/components/ui/button"

type WarehouseEditPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function WarehouseEditPage({ params }: WarehouseEditPageProps) {
  const { id } = await params
  const bodega = await getBodegaById(id)

  if (!bodega) {
    notFound()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Maestros</p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Editar bodega
          </h1>
          <p className="text-sm text-neutral-600">
            Actualiza la informacion de la bodega.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/warehouses">Volver</Link>
        </Button>
      </header>

      <WarehouseForm
        mode="edit"
        warehouseId={bodega.id}
        initialValues={{
          identificacion: bodega.identificacion,
          nombre: bodega.nombre,
          ubicacion: bodega.ubicacion ?? "",
          estado: bodega.estado,
        }}
      />
    </div>
  )
}
