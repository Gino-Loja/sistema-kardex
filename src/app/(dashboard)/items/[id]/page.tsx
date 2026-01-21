import Link from "next/link"

import { getItemById } from "@/lib/data/items"
import { Button } from "@/components/ui/button"

type ItemDetailPageProps = {
  params: Promise<{ id: string }>
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
  timeStyle: "short",
})

const numberFormatter = new Intl.NumberFormat("es-EC", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params
  const item = await getItemById(id)

  if (!item) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-neutral-900">
            Item no encontrado
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            El item que buscas no existe o fue eliminado.
          </p>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/items">Volver a items</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Maestros</p>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {item.nombre}
          </h1>
          <p className="text-sm text-neutral-600">Codigo: {item.codigo}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/items">Volver a items</Link>
        </Button>
      </header>

      <section className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="w-full max-w-sm">
            {item.imagenUrl ? (
              <img
                src={item.imagenUrl}
                alt={`Imagen de ${item.nombre}`}
                className="h-56 w-full rounded-2xl object-cover sm:h-64"
              />
            ) : (
              <div className="flex h-56 w-full items-center justify-center rounded-2xl border border-dashed border-neutral-200 text-xs text-neutral-400 sm:h-64">
                Sin imagen
              </div>
            )}
          </div>
          <div className="grid w-full gap-4 text-sm text-neutral-600 sm:grid-cols-2">
            <div>
              <span className="text-xs uppercase text-neutral-400">Codigo</span>
              <p className="text-base font-semibold text-neutral-900">
                {item.codigo}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase text-neutral-400">Categoria</span>
              <p className="text-sm text-neutral-900">
                {item.categoria ?? "Sin categoria"}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase text-neutral-400">Unidad</span>
              <p className="text-sm text-neutral-900">{item.unidadMedida}</p>
            </div>
            <div>
              <span className="text-xs uppercase text-neutral-400">Estado</span>
              <p className="text-sm capitalize text-neutral-900">{item.estado}</p>
            </div>
            <div>
              <span className="text-xs uppercase text-neutral-400">Costo promedio</span>
              <p className="text-sm text-neutral-900">
                {numberFormatter.format(item.costoPromedio)}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase text-neutral-400">Creado</span>
              <p className="text-sm text-neutral-900">
                {dateTimeFormatter.format(item.creadoEn)}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase text-neutral-400">Actualizado</span>
              <p className="text-sm text-neutral-900">
                {dateTimeFormatter.format(item.actualizadoEn)}
              </p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs uppercase text-neutral-400">Descripcion</span>
              <p className="text-sm text-neutral-900">{item.descripcion}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
