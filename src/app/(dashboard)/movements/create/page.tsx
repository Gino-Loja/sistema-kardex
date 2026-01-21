import Link from "next/link"

import { MovementForm } from "@/components/movements/movement-form"
import { Button } from "@/components/ui/button"

export default function MovementCreatePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Inventario</p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Nuevo Movimiento
          </h1>
          <p className="text-sm text-neutral-600">
            Registra un movimiento de entrada, salida o transferencia de inventario.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/movements">Volver</Link>
        </Button>
      </header>

      <MovementForm mode="create" />
    </div>
  )
}
