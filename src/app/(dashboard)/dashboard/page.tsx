import { DashboardSummaryCards } from "@/components/dashboard/summary-cards";
import { RotationTrendChart } from "@/components/dashboard/rotation-trend-chart";
import { StockAlerts } from "@/components/dashboard/stock-alerts";
import { getDashboardSummary } from "@/lib/queries/dashboard";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-neutral-500">Resumen</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-600">
          Visibilidad rápida de stock, valorización y alertas clave.
        </p>
      </header>

      <DashboardSummaryCards
        items={[
          {
            label: "Stock Total (Unidades)",
            value: formatNumber(summary.existenciasTotales, 0),
            variacion: summary.variacionStock,
            icon: "stock",
          },
          {
            label: "Valorización (Costo Promedio)",
            value: formatCurrency(summary.valorizacionTotal),
            variacion: summary.variacionValorizacion,
            icon: "valorizacion",
          },
          {
            label: "Rotación de Inventario",
            value: `${summary.rotacionInventario}x`,
            hint: "Anual",
            variacion: summary.variacionRotacion,
            icon: "rotacion",
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <RotationTrendChart data={summary.tendenciaRotacion} />
        <StockAlerts
          alertas={summary.alertasDetalladas}
          totalAlertas={summary.alertasStockCritico}
        />
      </div>
    </div>
  );
}
