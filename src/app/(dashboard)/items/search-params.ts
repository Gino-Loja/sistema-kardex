import { createLoader, parseAsInteger, parseAsString } from "nuqs/server"

export const itemsSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  search: parseAsString,
  status: parseAsString,
  dateFrom: parseAsString,
  dateTo: parseAsString,
} as const

export const loadItemsSearchParams = createLoader(itemsSearchParams)
