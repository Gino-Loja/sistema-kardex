"use client";

import { useEffect, useState } from "react";
import {
  IconLoader2,
  IconFilter,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconUser,
  IconBox,
  IconBuildingWarehouse,
  IconTruck,
  IconCategory,
  IconSettings,
  IconFileImport,
  IconArrowsExchange,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

type AuditEntity =
  | "movimiento"
  | "item"
  | "bodega"
  | "usuario"
  | "categoria"
  | "tercero"
  | "item_bodega"
  | "configuracion"
  | "importacion";

type AuditAction =
  | "crear"
  | "editar"
  | "eliminar"
  | "publicar"
  | "anular"
  | "importar"
  | "configurar";

interface AuditLogRow {
  id: string;
  entidad: AuditEntity;
  entidadId: string | null;
  accion: AuditAction;
  descripcion: string;
  usuarioId: string | null;
  usuarioNombre: string;
  metadata: Record<string, unknown> | null;
  creadoEn: string;
}

interface AuditLogResponse {
  data: AuditLogRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const ENTITY_LABELS: Record<AuditEntity, string> = {
  movimiento: "Movimiento",
  item: "Item",
  bodega: "Bodega",
  usuario: "Usuario",
  categoria: "Categoría",
  tercero: "Tercero",
  item_bodega: "Item-Bodega",
  configuracion: "Configuración",
  importacion: "Importación",
};

const ACTION_LABELS: Record<AuditAction, string> = {
  crear: "Crear",
  editar: "Editar",
  eliminar: "Eliminar",
  publicar: "Publicar",
  anular: "Anular",
  importar: "Importar",
  configurar: "Configurar",
};

const ACTION_COLORS: Record<AuditAction, string> = {
  crear: "bg-green-100 text-green-700",
  editar: "bg-blue-100 text-blue-700",
  eliminar: "bg-red-100 text-red-700",
  publicar: "bg-emerald-100 text-emerald-700",
  anular: "bg-orange-100 text-orange-700",
  importar: "bg-purple-100 text-purple-700",
  configurar: "bg-slate-100 text-slate-700",
};

const ENTITY_ICONS: Record<AuditEntity, React.ReactNode> = {
  movimiento: <IconArrowsExchange className="h-4 w-4" />,
  item: <IconBox className="h-4 w-4" />,
  bodega: <IconBuildingWarehouse className="h-4 w-4" />,
  usuario: <IconUser className="h-4 w-4" />,
  categoria: <IconCategory className="h-4 w-4" />,
  tercero: <IconTruck className="h-4 w-4" />,
  item_bodega: <IconBox className="h-4 w-4" />,
  configuracion: <IconSettings className="h-4 w-4" />,
  importacion: <IconFileImport className="h-4 w-4" />,
};

export default function AuditLogPage() {
  const [data, setData] = useState<AuditLogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [entidadFilter, setEntidadFilter] = useState<string>("");
  const [accionFilter, setAccionFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (entidadFilter) params.set("entidad", entidadFilter);
      if (accionFilter) params.set("accion", accionFilter);
      params.set("page", page.toString());
      params.set("pageSize", "15");

      const response = await fetch(`/api/audit-log?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Error al cargar la bitácora");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, entidadFilter, accionFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleFilterReset = () => {
    setEntidadFilter("");
    setAccionFilter("");
    setPage(1);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-neutral-500">Configuración</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900">
              Bitácora de auditoría
            </h1>
            <p className="text-sm text-neutral-600">
              Seguimiento de acciones críticas en el sistema.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
          >
            <IconRefresh
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </header>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
        <IconFilter className="h-4 w-4 text-neutral-400" />
        <select
          value={entidadFilter}
          onChange={(e) => {
            setEntidadFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm"
        >
          <option value="">Todas las entidades</option>
          {Object.entries(ENTITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={accionFilter}
          onChange={(e) => {
            setAccionFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm"
        >
          <option value="">Todas las acciones</option>
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {(entidadFilter || accionFilter) && (
          <button
            onClick={handleFilterReset}
            className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-700"
          >
            Limpiar filtros
          </button>
        )}
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="grid grid-cols-[140px_1fr_160px_180px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-500">
          <span>Entidad</span>
          <span>Acción</span>
          <span>Usuario</span>
          <span>Fecha</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center px-4 py-16">
            <IconLoader2 className="h-6 w-6 animate-spin text-neutral-400" />
            <span className="ml-2 text-sm text-neutral-500">
              Cargando bitácora...
            </span>
          </div>
        ) : error ? (
          <div className="px-4 py-10 text-center text-sm text-red-500">
            {error}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-neutral-500">
            Aún no hay eventos registrados.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {data?.data.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[140px_1fr_160px_180px] items-center gap-4 px-4 py-3 text-sm hover:bg-neutral-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">
                    {ENTITY_ICONS[row.entidad]}
                  </span>
                  <span className="font-medium text-neutral-700">
                    {ENTITY_LABELS[row.entidad]}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_COLORS[row.accion]}`}
                  >
                    {ACTION_LABELS[row.accion]}
                  </span>
                  <span className="text-neutral-600 line-clamp-1">
                    {row.descripcion}
                  </span>
                </div>
                <span className="text-neutral-600">{row.usuarioNombre}</span>
                <span className="text-neutral-500">
                  {formatDate(row.creadoEn)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-3">
            <span className="text-xs text-neutral-500">
              Mostrando página {data.pagination.page} de{" "}
              {data.pagination.totalPages} ({data.pagination.total} registros)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(data.pagination.totalPages, p + 1))
                }
                disabled={page === data.pagination.totalPages || isLoading}
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
