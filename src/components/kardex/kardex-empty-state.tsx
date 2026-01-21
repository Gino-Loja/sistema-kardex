"use client";

type KardexEmptyStateProps = {
  hasItemSelected: boolean;
  hasBodegaSelected?: boolean;
  message?: string;
};

export function KardexEmptyState({
  hasItemSelected,
  hasBodegaSelected = true,
  message,
}: KardexEmptyStateProps) {
  // Show message to select item first
  if (!hasItemSelected) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <svg
              className="h-6 w-6 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
            Selecciona un item y una bodega
          </h3>
          <p className="text-sm text-neutral-600">
            Utiliza los filtros de arriba para seleccionar el item y la bodega
            de los cuales deseas consultar el kardex.
          </p>
        </div>
      </div>
    );
  }

  // Show message to select bodega
  if (!hasBodegaSelected) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-6 w-6 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
            Selecciona una bodega
          </h3>
          <p className="text-sm text-neutral-600">
            El kardex requiere una bodega seleccionada para mostrar el stock y
            costo promedio correctamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <svg
            className="h-6 w-6 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-neutral-900">
          Sin movimientos
        </h3>
        <p className="text-sm text-neutral-600">
          {message ??
            "No hay movimientos registrados para este item en el rango de fechas seleccionado."}
        </p>
      </div>
    </div>
  );
}
