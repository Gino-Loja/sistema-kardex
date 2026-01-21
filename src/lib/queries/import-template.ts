import { formatCsv } from "@/lib/queries/csv";

export const getItemsImportTemplate = () => {
  const headers = [
    "codigo",
    "nombre",
    "descripcion",
    "unidad_medida",
    "categoria",
    "costo_promedio",
    "estado",
    "imagen_url",
  ];

  const sampleRow = [
    "COD-001",
    "Producto ejemplo",
    "Producto ejemplo",
    "UND",
    "General",
    "0",
    "activo",
    "https://example.com/imagen.png",
  ];

  return formatCsv(headers, [sampleRow]);
};
