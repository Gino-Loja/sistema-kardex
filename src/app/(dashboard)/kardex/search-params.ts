import { createLoader, parseAsInteger, parseAsString } from "nuqs/server";

export const kardexSearchParams = {
  itemId: parseAsString,
  bodegaId: parseAsString,
  fechaDesde: parseAsString,
  fechaHasta: parseAsString,
  tipo: parseAsString,
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(100),
} as const;

export const loadKardexSearchParams = createLoader(kardexSearchParams);
