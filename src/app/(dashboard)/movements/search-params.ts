import { createLoader, parseAsInteger, parseAsString } from "nuqs/server"

export const movementsSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  tipo: parseAsString,
  estado: parseAsString,
  fechaDesde: parseAsString,
  fechaHasta: parseAsString,
  search: parseAsString,
} as const

export const loadMovementsSearchParams = createLoader(movementsSearchParams)
