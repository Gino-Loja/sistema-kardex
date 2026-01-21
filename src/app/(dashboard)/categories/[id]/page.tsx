import Link from "next/link"

import { getCategoriaById } from "@/lib/data/categorias"
import { CategoryDeleteModal } from "@/components/categories/category-delete-modal"
import { Button } from "@/components/ui/button"

type CategoryDetailPageProps = {
  params: Promise<{ id: string }>
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
  timeStyle: "short",
})

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { id } = await params
  const categoria = await getCategoriaById(id)

  if (!categoria) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-neutral-900">
            Categoria no encontrada
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            La categoria solicitada no existe o fue eliminada.
          </p>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/categories">Volver a categorias</Link>
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
            {categoria.nombre}
          </h1>
          <p className="text-sm text-neutral-600">
            Estado: <span className="capitalize">{categoria.estado}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/categories">Volver a categorias</Link>
          </Button>
          <Button asChild>
            <Link href={`/categories/${categoria.id}/edit`}>Editar</Link>
          </Button>
          <CategoryDeleteModal
            categoryId={categoria.id}
            categoryLabel={categoria.nombre}
            trigger={<Button variant="destructive">Eliminar</Button>}
          />
        </div>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700 shadow-sm">
        <div>
          <span className="text-xs uppercase text-neutral-400">Descripcion</span>
          <p className="text-sm text-neutral-900">
            {categoria.descripcion?.trim() ? categoria.descripcion : "Sin descripcion"}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-xs uppercase text-neutral-400">Creado</span>
            <p className="text-sm text-neutral-900">
              {dateTimeFormatter.format(categoria.creadoEn)}
            </p>
          </div>
          <div>
            <span className="text-xs uppercase text-neutral-400">Actualizado</span>
            <p className="text-sm text-neutral-900">
              {dateTimeFormatter.format(categoria.actualizadoEn)}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
