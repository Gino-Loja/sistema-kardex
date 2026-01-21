"use client"

import { useUsersFilters } from "@/hooks/users/use-users-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function UserFilters() {
  const { filters, setSearch, setStatus, clearFilters } = useUsersFilters()

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-[220px] flex-col gap-1">
        <span className="text-xs font-medium text-neutral-500">Buscar</span>
        <Input
          placeholder="Nombre del usuario"
          value={filters.search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="flex min-w-[160px] flex-col gap-1">
        <span className="text-xs font-medium text-neutral-500">Estado</span>
        <select
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
          value={filters.status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">Todos</option>
          <option value="active">Activo</option>
          <option value="banned">Bloqueado</option>
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
