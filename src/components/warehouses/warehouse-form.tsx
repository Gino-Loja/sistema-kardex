"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import type { BodegaFormValues } from "@/lib/types/bodegas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type WarehouseFormProps = {
  mode: "create" | "edit"
  warehouseId?: string
  initialValues?: Partial<BodegaFormValues>
}

export function WarehouseForm({
  mode,
  warehouseId,
  initialValues,
}: WarehouseFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<BodegaFormValues>({
    identificacion: initialValues?.identificacion ?? "",
    nombre: initialValues?.nombre ?? "",
    ubicacion: initialValues?.ubicacion ?? "",
    estado: initialValues?.estado ?? "activo",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (key: keyof BodegaFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!values.identificacion.trim()) {
      nextErrors.identificacion = "La identificacion es obligatoria."
    }
    if (!values.nombre.trim()) {
      nextErrors.nombre = "El nombre es obligatorio."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submitLabel = useMemo(
    () => (mode === "create" ? "Crear" : "Guardar"),
    [mode],
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    if (mode === "edit" && !warehouseId) {
      setErrors({ form: "No se encontro la bodega." })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        identificacion: values.identificacion.trim(),
        nombre: values.nombre.trim(),
        ubicacion: values.ubicacion?.trim() || undefined,
        estado: values.estado,
      }

      const response = await fetch(
        mode === "create" ? "/api/bodegas" : `/api/bodegas/${warehouseId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        const fallback =
          mode === "create"
            ? "No se pudo crear la bodega."
            : "No se pudo actualizar la bodega."
        const message = response.status === 409
          ? "Ya existe una bodega con esa identificacion."
          : fallback
        setErrors({ form: message })
        return
      }

      if (mode === "create") {
        setValues({
          identificacion: "",
          nombre: "",
          ubicacion: "",
          estado: "activo",
        })
        router.push("/warehouses")
      } else {
        router.refresh()
      }
    } catch {
      setErrors({ form: "Ocurrio un error inesperado." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="identificacion">Identificacion</Label>
          <Input
            id="identificacion"
            value={values.identificacion}
            onChange={(event) => handleChange("identificacion", event.target.value)}
            aria-invalid={Boolean(errors.identificacion)}
          />
          {errors.identificacion ? (
            <span className="text-sm text-destructive">{errors.identificacion}</span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            value={values.nombre}
            onChange={(event) => handleChange("nombre", event.target.value)}
            aria-invalid={Boolean(errors.nombre)}
          />
          {errors.nombre ? (
            <span className="text-sm text-destructive">{errors.nombre}</span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <Label htmlFor="ubicacion">Ubicacion (opcional)</Label>
          <Textarea
            id="ubicacion"
            value={values.ubicacion ?? ""}
            onChange={(event) => handleChange("ubicacion", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="estado">Estado</Label>
          <select
            id="estado"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
            value={values.estado ?? "activo"}
            onChange={(event) => handleChange("estado", event.target.value)}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {errors.form ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.form}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
