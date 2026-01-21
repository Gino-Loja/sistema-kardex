"use client"

export default function ItemsError({
  reset,
}: {
  reset: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10">
      <h2 className="text-lg font-semibold text-neutral-900">
        No se pudo cargar la lista de items
      </h2>
      <p className="text-sm text-neutral-600">
        Intenta nuevamente o revisa tu conexion.
      </p>
      <button
        type="button"
        className="text-sm font-medium text-primary hover:underline"
        onClick={reset}
      >
        Reintentar
      </button>
    </div>
  )
}
