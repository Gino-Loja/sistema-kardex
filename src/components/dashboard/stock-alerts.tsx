import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AlertaStock } from "@/lib/queries/dashboard";
import Link from "next/link";

type StockAlertsProps = {
  alertas: AlertaStock[];
  totalAlertas: number;
};

export function StockAlerts({ alertas, totalAlertas }: StockAlertsProps) {
  const alertasCriticas = alertas.filter((a) => a.nivel === "critico").length;

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">
          Alertas de Stock
        </h2>
        {alertasCriticas > 0 && (
          <Badge variant="destructive" className="rounded-full px-3">
            {alertasCriticas} Críticos
          </Badge>
        )}
      </div>

      <div className="divide-y divide-neutral-100">
        {alertas.length === 0 ? (
          <div className="py-8 text-center text-neutral-500">
            No hay alertas de stock
          </div>
        ) : (
          alertas.map((alerta) => (
            <div
              key={alerta.id}
              className="flex items-center justify-between py-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-neutral-900">{alerta.nombre}</p>
                  <Badge
                    variant={alerta.nivel === "critico" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {alerta.nivel === "critico" ? "Crítico" : "Bajo"}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500">SKU: {alerta.codigo}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Stock: {alerta.stockActual} / Mín: {alerta.stockMinimo}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/movements/create?itemId=${alerta.itemId}&tipo=entrada`}>
                  Pedir
                </Link>
              </Button>
            </div>
          ))
        )}
      </div>

      {totalAlertas > alertas.length && (
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <Link
            href="/items?filter=bajo-stock"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Ver todas las alertas →
          </Link>
        </div>
      )}
    </article>
  );
}
