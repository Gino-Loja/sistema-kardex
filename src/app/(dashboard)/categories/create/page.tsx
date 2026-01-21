import Link from "next/link"

import { CategoryForm } from "@/components/categories/category-form"
import { Button } from "@/components/ui/button"

export default function CategoryCreatePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Maestros</p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Crear categoria
          </h1>
          <p className="text-sm text-neutral-600">
            Registra una nueva categoria para organizar los items.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/categories">Volver</Link>
        </Button>
      </header>

      <CategoryForm mode="create" />
    </div>
  )
}
