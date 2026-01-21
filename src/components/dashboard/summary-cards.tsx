import {
  IconPackage,
  IconCurrencyDollar,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type SummaryCard = {
  label: string;
  value: string;
  hint?: string;
  variacion?: number;
  icon: "stock" | "valorizacion" | "rotacion";
};

type DashboardSummaryCardsProps = {
  items: SummaryCard[];
};

const iconMap = {
  stock: IconPackage,
  valorizacion: IconCurrencyDollar,
  rotacion: IconRefresh,
};

const iconBgMap = {
  stock: "bg-emerald-50",
  valorizacion: "bg-amber-50",
  rotacion: "bg-sky-50",
};

const iconColorMap = {
  stock: "text-emerald-600",
  valorizacion: "text-amber-600",
  rotacion: "text-sky-600",
};

export const DashboardSummaryCards = ({ items }: DashboardSummaryCardsProps) => (
  <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {items.map((item) => {
      const Icon = iconMap[item.icon];
      return (
        <article
          key={item.label}
          className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">{item.label}</p>
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                iconBgMap[item.icon]
              )}
            >
              <Icon className={cn("h-5 w-5", iconColorMap[item.icon])} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold text-neutral-900">
            {item.value}
          </p>
          {item.hint && (
            <p className="mt-1 text-sm text-neutral-500">{item.hint}</p>
          )}
          {item.variacion !== undefined && (
            <div className="mt-3 flex items-center gap-1">
              {item.variacion >= 0 ? (
                <IconTrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <IconTrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  item.variacion >= 0 ? "text-emerald-600" : "text-red-500"
                )}
              >
                {item.variacion >= 0 ? "+" : ""}
                {item.variacion}%
              </span>
              <span className="text-sm text-neutral-400">vs. mes anterior</span>
            </div>
          )}
        </article>
      );
    })}
  </section>
);
