"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { importItemsFromCsv } from "@/lib/actions/imports";
import { getItemsImportTemplate } from "@/lib/queries/import-template";
import { IconLoader2 } from "@tabler/icons-react";

export default function ItemsImportPage() {
  const [isPending, startTransition] = useTransition();
  const template = getItemsImportTemplate();
  const templateHref = `data:text/csv;charset=utf-8,${encodeURIComponent(
    template,
  )}`;

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await importItemsFromCsv(formData);
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm  text-neutral-500">
          Catalogos
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Importar items
        </h1>
        <p className="text-sm text-neutral-600">
          Carga un CSV para crear o actualizar items existentes.
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <a
            href={templateHref}
            download="items-import-template.csv"
            className="text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4"
          >
            Descargar plantilla CSV
          </a>
          <p className="text-xs text-neutral-500">
            Columnas requeridas: codigo, descripcion, unidad_medida.
          </p>
        </div>

        <form action={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-xs  text-neutral-500">
            Archivo CSV
            <input
              type="file"
              name="archivo"
              accept=".csv,text/csv"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={isPending}
            />
          </label>
          <Button
            type="submit"
            variant={'default'}
            disabled={isPending}
            className="w-fit  border px-5 py-2 text-xs font-semibold  "
          >
            {isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              "Importar catalogo"
            )}
          </Button>
          {isPending && (
            <p className="text-sm text-neutral-500">
              Procesando archivo, esto puede tomar unos momentos...
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
