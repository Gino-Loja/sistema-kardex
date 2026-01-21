import Link from "next/link"

import { getTerceroById } from "@/lib/data/terceros"
import { Button } from "@/components/ui/button"

type ThirdPartyDetailPageProps = {
  params: Promise<{ id: string }>
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
  timeStyle: "short",
})

export default async function ThirdPartyDetailPage({ params }: ThirdPartyDetailPageProps) {
  const { id } = await params
  const tercero = await getTerceroById(id)

  if (!tercero) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-neutral-900">
            Tercero no encontrado
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            El tercero que buscas no existe o fue eliminado.
          </p>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/third-parties">Volver a terceros</Link>
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
            {tercero.nombre}
          </h1>
          <p className="text-sm text-neutral-600">
            Identificacion: {tercero.identificacion}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/third-parties">Volver a terceros</Link>
        </Button>
      </header>

      <section className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid w-full gap-4 text-sm text-neutral-600 sm:grid-cols-2">
          <div>
            <span className="text-xs uppercase text-neutral-400">Tipo</span>
            <p className="text-sm capitalize text-neutral-900">{tercero.tipo}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-neutral-400">Estado</span>
            <p className="text-sm capitalize text-neutral-900">{tercero.estado}</p>
          </div>
          <div>
            <span className="text-xs uppercase text-neutral-400">Telefono</span>
            <p className="text-sm text-neutral-900">
              {tercero.telefono ?? "Sin telefono"}
            </p>
          </div>
          <div>
            <span className="text-xs uppercase text-neutral-400">Email</span>
            <p className="text-sm text-neutral-900">
              {tercero.email ?? "Sin email"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-xs uppercase text-neutral-400">Direccion</span>
            <p className="text-sm text-neutral-900">
              {tercero.direccion ?? "Sin direccion"}
            </p>
          </div>
          <div>
            <span className="text-xs uppercase text-neutral-400">Creado</span>
            <p className="text-sm text-neutral-900">
              {dateTimeFormatter.format(tercero.creadoEn)}
            </p>
          </div>
          <div>
            <span className="text-xs uppercase text-neutral-400">Actualizado</span>
            <p className="text-sm text-neutral-900">
              {dateTimeFormatter.format(tercero.actualizadoEn)}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
