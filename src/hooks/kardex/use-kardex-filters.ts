"use client";

import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

const queryOptions = { history: "push", shallow: false } as const;
const parsePage = parseAsInteger.withDefault(1).withOptions(queryOptions);
const parsePageSize = parseAsInteger.withDefault(100).withOptions(queryOptions);
const parseText = parseAsString.withDefault("").withOptions(queryOptions);

export const useKardexFilters = () => {
  const [page, setPage] = useQueryState("page", parsePage);
  const [pageSize, setPageSize] = useQueryState("pageSize", parsePageSize);
  const [itemId, setItemIdValue] = useQueryState("itemId", parseText);
  const [bodegaId, setBodegaIdValue] = useQueryState("bodegaId", parseText);
  const [fechaDesde, setFechaDesdeValue] = useQueryState("fechaDesde", parseText);
  const [fechaHasta, setFechaHastaValue] = useQueryState("fechaHasta", parseText);
  const [tipo, setTipoValue] = useQueryState("tipo", parseText);

  const setItemId = (value: string) => {
    void setItemIdValue(value || null);
    void setPage(1);
  };

  const setBodegaId = (value: string) => {
    void setBodegaIdValue(value || null);
    void setPage(1);
  };

  const setFechaDesde = (value: string) => {
    void setFechaDesdeValue(value || null);
    void setPage(1);
  };

  const setFechaHasta = (value: string) => {
    void setFechaHastaValue(value || null);
    void setPage(1);
  };

  const setTipo = (value: string) => {
    void setTipoValue(value || null);
    void setPage(1);
  };

  const setPageSizeValue = (value: number) => {
    void setPageSize(value);
    void setPage(1);
  };

  const clearFilters = () => {
    void setBodegaIdValue(null);
    void setFechaDesdeValue(null);
    void setFechaHastaValue(null);
    void setTipoValue(null);
    void setPage(1);
  };

  return {
    filters: {
      itemId,
      bodegaId,
      fechaDesde,
      fechaHasta,
      tipo,
      page,
      pageSize,
    },
    setItemId,
    setBodegaId,
    setFechaDesde,
    setFechaHasta,
    setTipo,
    setPage,
    setPageSize: setPageSizeValue,
    clearFilters,
  };
};
