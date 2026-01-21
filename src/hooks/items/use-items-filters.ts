"use client"

import { parseAsInteger, parseAsString, useQueryState } from "nuqs"

const queryOptions = { history: "push", shallow: false } as const
const parsePage = parseAsInteger.withDefault(1).withOptions(queryOptions)
const parsePageSize = parseAsInteger.withDefault(20).withOptions(queryOptions)
const parseText = parseAsString.withDefault("").withOptions(queryOptions)

export const useItemsFilters = () => {
  const [page, setPage] = useQueryState("page", parsePage)
  const [pageSize, setPageSize] = useQueryState("pageSize", parsePageSize)
  const [search, setSearchValue] = useQueryState("search", parseText)
  const [status, setStatusValue] = useQueryState("status", parseText)
  const [dateFrom, setDateFromValue] = useQueryState("dateFrom", parseText)
  const [dateTo, setDateToValue] = useQueryState("dateTo", parseText)

  const setSearch = (value: string) => {
    void setSearchValue(value || null)
    void setPage(1)
  }

  const setStatus = (value: string) => {
    void setStatusValue(value || null)
    void setPage(1)
  }

  const setDateFrom = (value: string) => {
    void setDateFromValue(value || null)
    void setPage(1)
  }

  const setDateTo = (value: string) => {
    void setDateToValue(value || null)
    void setPage(1)
  }

  const setPageSizeValue = (value: number) => {
    void setPageSize(value)
    void setPage(1)
  }

  const clearFilters = () => {
    void setSearchValue(null)
    void setStatusValue(null)
    void setDateFromValue(null)
    void setDateToValue(null)
    void setPage(1)
  }

  return {
    filters: {
      search,
      status,
      dateFrom,
      dateTo,
      page,
      pageSize,
    },
    setSearch,
    setStatus,
    setDateFrom,
    setDateTo,
    setPage,
    setPageSize: setPageSizeValue,
    clearFilters,
  }
}
