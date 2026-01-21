import Link from "next/link"
import { notFound } from "next/navigation"

import { getCategoriaById } from "@/lib/data/categorias"
import { CategoryForm } from "@/components/categories/category-form"
import { Button } from "@/components/ui/button"

type CategoryEditPageProps = {
  params: Promise<{ id: string }>
}

export default async function CategoryEditPage({ params }: CategoryEditPageProps) {
  const { id } = await params
  const categoria = await getCategoriaById(id)

  if (!categoria) {
    notFound()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Maestros</p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Editar categoria
          </h1>
          <p className="text-sm text-neutral-600">
            Actualiza la informacion de la categoria.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/categories/${categoria.id}`}>Volver</Link>
        </Button>
      </header>

      <CategoryForm
        mode="edit"
        categoryId={categoria.id}
        initialValues={{
          nombre: categoria.nombre,
          descripcion: categoria.descripcion ?? "",
          estado: (categoria.estado ?? "activo") as "activo" | "inactivo",
        }}
      />
    </div>
  )
}
