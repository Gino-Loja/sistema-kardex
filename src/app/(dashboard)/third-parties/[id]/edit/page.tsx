import Link from "next/link"
import { notFound } from "next/navigation"

import { getTerceroById } from "@/lib/data/terceros"
import { ThirdPartyForm } from "@/components/third-parties/third-party-form"
import { ThirdPartyDeleteModal } from "@/components/third-parties/third-party-delete-modal"
import { Button } from "@/components/ui/button"

type ThirdPartyEditPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ThirdPartyEditPage({ params }: ThirdPartyEditPageProps) {
  const { id } = await params
  const tercero = await getTerceroById(id)

  if (!tercero) {
    notFound()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Maestros</p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Editar tercero
          </h1>
          <p className="text-sm text-neutral-600">
            Actualiza la informacion del tercero.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/third-parties">Volver</Link>
          </Button>
          <ThirdPartyDeleteModal
            terceroId={tercero.id}
            terceroLabel={tercero.nombre}
          />
        </div>
      </header>

      <ThirdPartyForm
        mode="edit"
        terceroId={tercero.id}
        initialValues={{
          tipo: tercero.tipo,
          identificacion: tercero.identificacion,
          nombre: tercero.nombre,
          telefono: tercero.telefono ?? "",
          email: tercero.email ?? "",
          direccion: tercero.direccion ?? "",
          estado: tercero.estado,
        }}
      />
    </div>
  )
}
