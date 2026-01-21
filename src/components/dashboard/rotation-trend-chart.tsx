"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { TendenciaRotacion } from "@/lib/queries/dashboard";

type RotationTrendChartProps = {
  data: TendenciaRotacion[];
};

const chartConfig = {
  real: {
    label: "Real",
    color: "#fbbf24",
  },
  proyectado: {
    label: "Proyectado",
    color: "#d1d5db",
  },
} satisfies ChartConfig;

export function RotationTrendChart({ data }: RotationTrendChartProps) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          Tendencia de Rotación
        </h2>
        <p className="text-sm text-neutral-500">
          Últimos 6 meses (Costo de ventas / Inventario promedio)
        </p>
      </div>
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fillReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillProyectado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#d1d5db" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="mes"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
            tickFormatter={(value) => `${value}`}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Area
            dataKey="proyectado"
            type="monotone"
            fill="url(#fillProyectado)"
            stroke="#d1d5db"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Area
            dataKey="real"
            type="monotone"
            fill="url(#fillReal)"
            stroke="#fbbf24"
            strokeWidth={2}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </article>
  );
}
