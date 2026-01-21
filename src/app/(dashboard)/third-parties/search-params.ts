import { createLoader, parseAsInteger, parseAsString } from "nuqs/server"

export const thirdPartiesSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  search: parseAsString,
  estado: parseAsString,
  tipo: parseAsString,
} as const

export const loadThirdPartiesSearchParams = createLoader(thirdPartiesSearchParams)
