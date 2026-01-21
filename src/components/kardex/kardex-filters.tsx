"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKardexFilters } from "@/hooks/kardex/use-kardex-filters";

type KardexFiltersProps = {
  bodegas?: Array<{ id: string; nombre: string }>;
  items?: Array<{ id: string; codigo: string; nombre: string }>;
  onExport?: () => void;
  onViewAudit?: () => void;
  isExporting?: boolean;
};

export function KardexFilters({
  bodegas = [],
  items = [],
  onExport,
  onViewAudit,
  isExporting = false,
}: KardexFiltersProps) {
  const {
    filters,
    setItemId,
    setBodegaId,
    setFechaDesde,
    setFechaHasta,
    setTipo,
    clearFilters,
  } = useKardexFilters();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        {/* Item selector */}
        <div className="flex min-w-[200px] flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500">Item</span>
          <select
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
            value={filters.itemId}
            onChange={(e) => setItemId(e.target.value)}
          >
            <option value="">Seleccionar item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.codigo} - {item.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Bodega selector */}
        <div className="flex min-w-[160px] flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500">Bodega</span>
          <select
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
            value={filters.bodegaId}
            onChange={(e) => setBodegaId(e.target.value)}
          >
            <option value="">Todas</option>
            {bodegas.map((bodega) => (
              <option key={bodega.id} value={bodega.id}>
                {bodega.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo filter */}
        <div className="flex min-w-[140px] flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500">Tipo</span>
          <select
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
            value={filters.tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
            <option value="transferencia">Transferencias</option>
          </select>
        </div>

        {/* Date from */}
        <div className="flex min-w-[150px] flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500">Desde</span>
          <Input
            type="date"
            className="h-8"
            value={filters.fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </div>

        {/* Date to */}
        <div className="flex min-w-[150px] flex-col gap-1">
          <span className="text-xs font-medium text-neutral-500">Hasta</span>
          <Input
            type="date"
            className="h-8"
            value={filters.fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>

        {/* Clear button */}
        <Button
          type="button"
          variant="outline"
          className="h-8"
          onClick={clearFilters}
        >
          Limpiar
        </Button>
      </div>

      {/* Action buttons row */}
      {(onExport || onViewAudit) && (
        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3">
          {onExport && (
            <Button
              type="button"
              variant="outline"
              className="h-8"
              onClick={onExport}
              disabled={!filters.itemId || isExporting}
            >
              {isExporting ? "Exportando..." : "Exportar CSV"}
            </Button>
          )}
          {onViewAudit && (
            <Button
              type="button"
              variant="ghost"
              className="h-8 text-neutral-600"
              onClick={onViewAudit}
              disabled={!filters.itemId}
            >
              Ver historial de costos
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
