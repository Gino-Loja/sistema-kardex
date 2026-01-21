"use client"

import { useThirdPartiesFilters } from "@/hooks/third-parties/use-third-parties-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ThirdPartyFilters() {
  const { filters, setSearch, setEstado, setTipo, clearFilters } =
    useThirdPartiesFilters()

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-[220px] flex-col gap-1">
        <span className="text-xs font-medium text-neutral-500">Buscar</span>
        <Input
          placeholder="Nombre del tercero"
          value={filters.search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="flex min-w-[160px] flex-col gap-1">
        <span className="text-xs font-medium text-neutral-500">Estado</span>
        <select
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
          value={filters.estado}
          onChange={(event) => setEstado(event.target.value)}
        >
          <option value="">Activos</option>
          <option value="inactivo">Inactivos</option>
          <option value="todos">Todos</option>
        </select>
      </div>
      <div className="flex min-w-[160px] flex-col gap-1">
        <span className="text-xs font-medium text-neutral-500">Tipo</span>
        <select
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
          value={filters.tipo}
          onChange={(event) => setTipo(event.target.value)}
        >
          <option value="">Todos</option>
          <option value="proveedor">Proveedor</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-8"
        onClick={clearFilters}
      >
        Limpiar
      </Button>
    </div>
  )
}
