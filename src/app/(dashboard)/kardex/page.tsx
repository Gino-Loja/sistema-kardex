import Link from "next/link";
import type { SearchParams } from "nuqs/server";

import { getKardexData } from "@/lib/data/kardex";
import { listItems } from "@/lib/data/items";
import { listBodegas } from "@/lib/data/bodegas";
import { getAuthSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/guards";
import { kardexQuerySchema } from "@/lib/validators/kardex";
import { KardexTable } from "@/components/kardex/kardex-table";
import { KardexFilters } from "@/components/kardex/kardex-filters";
import { KardexEmptyState } from "@/components/kardex/kardex-empty-state";
import { Button } from "@/components/ui/button";
import { loadKardexSearchParams } from "./search-params";

type KardexPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function KardexPage({ searchParams }: KardexPageProps) {
  const resolvedSearchParams = await loadKardexSearchParams(searchParams);
  const session = await getAuthSession();
  const role = session?.user?.role;
  const canReadMovements = hasPermission(role, "movements:read");

  if (!canReadMovements) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <h1 className="text-3xl font-semibold text-neutral-900">Kardex</h1>
        <p className="text-sm text-red-600">
          No tienes permisos para ver el kardex.
        </p>
      </div>
    );
  }

  // Fetch items and bodegas for filter dropdowns
  const [itemsResult, bodegasResult] = await Promise.all([
    listItems({ page: 1, pageSize: 500 }),
    listBodegas({ page: 1, pageSize: 100 }),
  ]);

  const itemOptions = itemsResult.items.map((item) => ({
    id: item.id,
    codigo: item.codigo,
    nombre: item.nombre,
  }));

  const bodegaOptions = bodegasResult.items.map((bodega) => ({
    id: bodega.id,
    nombre: bodega.nombre,
  }));

  const itemId = resolvedSearchParams.itemId;
  const rawQuery = {
    itemId: itemId ?? undefined,
    bodegaId: resolvedSearchParams.bodegaId ?? undefined,
    fechaDesde: resolvedSearchParams.fechaDesde ?? undefined,
    fechaHasta: resolvedSearchParams.fechaHasta ?? undefined,
    tipo: resolvedSearchParams.tipo ?? undefined,
    page: resolvedSearchParams.page,
    pageSize: resolvedSearchParams.pageSize,
  };

  // Build export URL
  const exportUrl = itemId
    ? `/api/kardex/export?itemId=${itemId}${rawQuery.bodegaId ? `&bodegaId=${rawQuery.bodegaId}` : ""}${rawQuery.fechaDesde ? `&fechaDesde=${rawQuery.fechaDesde}` : ""}${rawQuery.fechaHasta ? `&fechaHasta=${rawQuery.fechaHasta}` : ""}${rawQuery.tipo ? `&tipo=${rawQuery.tipo}` : ""}`
    : null;

  const bodegaId = resolvedSearchParams.bodegaId;

  // If no item or bodega selected, show empty state with filters
  if (!itemId || !bodegaId) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Reportes</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Kardex</h1>
          <p className="text-sm text-neutral-600">
            Consulta el kardex valorizado con metodo promedio ponderado.
          </p>
        </header>

        <KardexFilters items={itemOptions} bodegas={bodegaOptions} />

        <KardexEmptyState hasItemSelected={!!itemId} hasBodegaSelected={!!bodegaId} />
      </div>
    );
  }

  // Validate and fetch kardex data
  const parsed = kardexQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Reportes</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Kardex</h1>
        </header>

        <KardexFilters items={itemOptions} bodegas={bodegaOptions} />

        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Error en los parametros de busqueda. Por favor verifica los filtros.
        </div>
      </div>
    );
  }

  let kardexData;
  try {
    kardexData = await getKardexData(parsed.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "KARDEX_ERROR";
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Reportes</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Kardex</h1>
        </header>

        <KardexFilters items={itemOptions} bodegas={bodegaOptions} />

        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {message === "ITEM_NOT_FOUND"
            ? "El item seleccionado no existe."
            : `Error al cargar el kardex: ${message}`}
        </div>
      </div>
    );
  }

  const { data: rows, pagination, item, resumen } = kardexData;
  const { page, totalPages, total } = pagination;

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("itemId", itemId);
    if (rawQuery.bodegaId) params.set("bodegaId", rawQuery.bodegaId);
    if (rawQuery.fechaDesde) params.set("fechaDesde", rawQuery.fechaDesde);
    if (rawQuery.fechaHasta) params.set("fechaHasta", rawQuery.fechaHasta);
    if (rawQuery.tipo) params.set("tipo", rawQuery.tipo);
    if (rawQuery.pageSize) params.set("pageSize", String(rawQuery.pageSize));
    params.set("page", String(nextPage));
    return `/kardex?${params.toString()}`;
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-neutral-500">Reportes</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Kardex</h1>
        <p className="text-sm text-neutral-600">
          Consulta el kardex valorizado con metodo promedio ponderado.
        </p>
      </header>

      <KardexFilters items={itemOptions} bodegas={bodegaOptions} />

      {/* Export button */}
      {exportUrl && (
        <div className="flex items-center gap-3">
          <a
            href={exportUrl}
            download
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Exportar CSV
          </a>
          {/* <Link
            href={`/api/kardex/auditoria?itemId=${itemId}${rawQuery.bodegaId ? `&bodegaId=${rawQuery.bodegaId}` : ""}`}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-neutral-500 transition hover:text-neutral-700"
            target="_blank"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Ver historial de costos
          </Link> */}
        </div>
      )}

      {rows.length === 0 ? (
        <KardexEmptyState hasItemSelected={true} />
      ) : (
        <>
          <KardexTable rows={rows} resumen={resumen} item={item} />

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500">
            <span>
              Mostrando pagina {page} de {totalPages} · {total} movimientos
            </span>
            <div className="flex items-center gap-2">
              {page <= 1 ? (
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href={buildPageHref(page - 1)}>Anterior</Link>
                </Button>
              )}
              {page >= totalPages ? (
                <Button variant="outline" size="sm" disabled>
                  Siguiente
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href={buildPageHref(page + 1)}>Siguiente</Link>
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
