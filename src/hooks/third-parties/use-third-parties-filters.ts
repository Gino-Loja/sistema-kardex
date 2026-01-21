"use client"

import { parseAsInteger, parseAsString, useQueryState } from "nuqs"

const queryOptions = { history: "push", shallow: false } as const
const parsePage = parseAsInteger.withDefault(1).withOptions(queryOptions)
const parsePageSize = parseAsInteger.withDefault(20).withOptions(queryOptions)
const parseText = parseAsString.withDefault("").withOptions(queryOptions)

export const useThirdPartiesFilters = () => {
  const [page, setPage] = useQueryState("page", parsePage)
  const [pageSize, setPageSize] = useQueryState("pageSize", parsePageSize)
  const [search, setSearchValue] = useQueryState("search", parseText)
  const [estado, setEstadoValue] = useQueryState("estado", parseText)
  const [tipo, setTipoValue] = useQueryState("tipo", parseText)

  const setSearch = (value: string) => {
    void setSearchValue(value || null)
    void setPage(1)
  }

  const setEstado = (value: string) => {
    void setEstadoValue(value || null)
    void setPage(1)
  }

  const setTipo = (value: string) => {
    void setTipoValue(value || null)
    void setPage(1)
  }

  const setPageSizeValue = (value: number) => {
    void setPageSize(value)
    void setPage(1)
  }

  const clearFilters = () => {
    void setSearchValue(null)
    void setEstadoValue(null)
    void setTipoValue(null)
    void setPage(1)
  }

  return {
    filters: {
      search,
      estado,
      tipo,
      page,
      pageSize,
    },
    setSearch,
    setEstado,
    setTipo,
    setPage,
    setPageSize: setPageSizeValue,
    clearFilters,
  }
}
