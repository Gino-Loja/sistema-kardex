"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type CategoryFormValues = {
  nombre: string
  descripcion: string
  estado: "activo" | "inactivo"
}

type CategoryFormProps = {
  mode: "create" | "edit"
  categoryId?: string
  initialValues?: Partial<CategoryFormValues>
}

export function CategoryForm({ mode, categoryId, initialValues }: CategoryFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<CategoryFormValues>({
    nombre: initialValues?.nombre ?? "",
    descripcion: initialValues?.descripcion ?? "",
    estado: initialValues?.estado ?? "activo",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (key: keyof CategoryFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

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

    if (mode === "edit" && !categoryId) {
      setErrors({ form: "No se encontro la categoria." })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim() || undefined,
        estado: values.estado,
      }

      const response = await fetch(
        mode === "create" ? "/api/categories" : `/api/categories/${categoryId}`,
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
            ? "No se pudo crear la categoria."
            : "No se pudo actualizar la categoria."
        const message = response.status === 409
          ? "Ya existe una categoria con ese nombre."
          : fallback
        setErrors({ form: message })
        return
      }

      if (mode === "create") {
        setValues({ nombre: "", descripcion: "", estado: "activo" })
        router.push("/categories")
      } else {
        router.refresh()
      }
    } catch (error) {
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
          <Label htmlFor="descripcion">Descripcion (opcional)</Label>
          <Textarea
            id="descripcion"
            value={values.descripcion}
            onChange={(event) => handleChange("descripcion", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="estado">Estado</Label>
          <select
            id="estado"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
            value={values.estado}
            onChange={(event) =>
              handleChange("estado", event.target.value as CategoryFormValues["estado"])
            }
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
