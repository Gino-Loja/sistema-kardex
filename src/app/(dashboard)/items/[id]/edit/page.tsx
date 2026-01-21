import Link from "next/link"
import { notFound } from "next/navigation"

import { getItemById } from "@/lib/data/items"
import { ItemForm } from "@/components/items/item-form"
import { ItemDeleteModal } from "@/components/items/item-delete-modal"
import { Button } from "@/components/ui/button"

type ItemEditPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ItemEditPage({ params }: ItemEditPageProps) {
  const { id } = await params
  const item = await getItemById(id)

  if (!item) {
    notFound()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Maestros</p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Editar item
          </h1>
          <p className="text-sm text-neutral-600">
            Actualiza la informacion del item y su imagen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/items">Volver</Link>
          </Button>
          <ItemDeleteModal itemId={item.id} itemLabel={item.nombre} />
        </div>
      </header>

      <ItemForm
        mode="edit"
        itemId={item.id}
        initialValues={{
          codigo: item.codigo,
          nombre: item.nombre,
          descripcion: item.descripcion,
          unidadMedida: item.unidadMedida,
          categoriaId: item.categoriaId ?? "",
          estado: item.estado,
          imagenUrl: item.imagenUrl ?? null,
        }}
      />
    </div>
  )
}
