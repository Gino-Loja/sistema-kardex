"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import type { TerceroFormValues } from "@/lib/types/terceros"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ThirdPartyFormProps = {
  mode: "create" | "edit"
  terceroId?: string
  initialValues?: TerceroFormValues
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ThirdPartyForm({
  mode,
  terceroId,
  initialValues,
}: ThirdPartyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [values, setValues] = useState<TerceroFormValues>({
    tipo: initialValues?.tipo ?? "proveedor",
    identificacion: initialValues?.identificacion ?? "",
    nombre: initialValues?.nombre ?? "",
    telefono: initialValues?.telefono ?? "",
    email: initialValues?.email ?? "",
    direccion: initialValues?.direccion ?? "",
    estado: initialValues?.estado ?? "activo",
  })

  const handleChange = (key: keyof TerceroFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!values.tipo?.trim()) {
      nextErrors.tipo = "El tipo es obligatorio."
    }
    if (!values.identificacion?.trim()) {
      nextErrors.identificacion = "La identificacion es obligatoria."
    }
    if (!values.nombre?.trim()) {
      nextErrors.nombre = "El nombre es obligatorio."
    }
    if (values.email && !emailPattern.test(values.email)) {
      nextErrors.email = "El email no es valido."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    const payload = {
      tipo: values.tipo,
      identificacion: values.identificacion,
      nombre: values.nombre,
      telefono: values.telefono || undefined,
      email: values.email || undefined,
      direccion: values.direccion || undefined,
      estado: values.estado || undefined,
    }

    try {
      const response = await fetch(
        mode === "create"
          ? "/api/third-parties"
          : `/api/third-parties/${terceroId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        setErrors({ form: "No se pudo guardar el tercero." })
        return
      }

      if (mode === "create") {
        router.push("/third-parties")
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
          <Label htmlFor="tipo">Tipo</Label>
          <select
            id="tipo"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
            value={values.tipo ?? "proveedor"}
            onChange={(event) => handleChange("tipo", event.target.value)}
          >
            <option value="proveedor">Proveedor</option>
            <option value="cliente">Cliente</option>
          </select>
          {errors.tipo ? (
            <span className="text-sm text-destructive">{errors.tipo}</span>
          ) : null}
        </div>
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
        <div className="flex flex-col gap-1 md:col-span-2">
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
        <div className="flex flex-col gap-1">
          <Label htmlFor="telefono">Telefono</Label>
          <Input
            id="telefono"
            value={values.telefono ?? ""}
            onChange={(event) => handleChange("telefono", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email ?? ""}
            onChange={(event) => handleChange("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? (
            <span className="text-sm text-destructive">{errors.email}</span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <Label htmlFor="direccion">Direccion</Label>
          <Textarea
            id="direccion"
            value={values.direccion ?? ""}
            onChange={(event) => handleChange("direccion", event.target.value)}
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

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  )
}
