"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import type { ItemFormValues } from "@/lib/types/items"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

type CategoriaOption = {
  id: string
  nombre: string
  estado?: string
}

type ItemFormProps = {
  mode: "create" | "edit"
  itemId?: string
  initialValues?: ItemFormValues
}

export function ItemForm({ mode, itemId, initialValues }: ItemFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialValues?.imagenUrl ?? null,
  )
  const [categorias, setCategorias] = useState<CategoriaOption[]>([])

  const [values, setValues] = useState<ItemFormValues>({
    codigo: initialValues?.codigo ?? "",
    nombre: initialValues?.nombre ?? "",
    descripcion: initialValues?.descripcion ?? "",
    unidadMedida: initialValues?.unidadMedida ?? "",
    categoriaId: initialValues?.categoriaId ?? "",
    estado: initialValues?.estado ?? "activo",
    imagenUrl: initialValues?.imagenUrl ?? null,
  })

  useEffect(() => {
    if (!imageFile) {
      return
    }

    const nextPreview = URL.createObjectURL(imageFile)
    setImagePreview(nextPreview)

    return () => {
      URL.revokeObjectURL(nextPreview)
    }
  }, [imageFile])

  useEffect(() => {
    let active = true

    const loadCategorias = async () => {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) {
          return
        }
        const data = (await response.json()) as CategoriaOption[]
        if (active) {
          setCategorias(data.filter((categoria) => categoria.estado !== "inactivo"))
        }
      } catch {
        // Ignore category fetch errors to avoid blocking the form.
      }
    }

    void loadCategorias()

    return () => {
      active = false
    }
  }, [])

  const imageError = useMemo(() => errors.image, [errors.image])

  const handleChange = (key: keyof ItemFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleImageChange = (file: File | null) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next.image
      return next
    })
    setImageFile(file)
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!values.codigo.trim()) {
      nextErrors.codigo = "El codigo es obligatorio."
    }
    if (!values.nombre.trim()) {
      nextErrors.nombre = "El nombre es obligatorio."
    }
    if (!values.descripcion.trim()) {
      nextErrors.descripcion = "La descripcion es obligatoria."
    }
    if (!values.unidadMedida.trim()) {
      nextErrors.unidadMedida = "La unidad es obligatoria."
    }

    if (imageFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
        nextErrors.image = "Formato de imagen invalido."
      } else if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
        nextErrors.image = "La imagen supera los 5 MB."
      }
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

    const formData = new FormData()
    formData.append("codigo", values.codigo)
    formData.append("nombre", values.nombre)
    formData.append("descripcion", values.descripcion)
    formData.append("unidadMedida", values.unidadMedida)

    formData.append("categoriaId", values.categoriaId ?? "")

    if (values.estado) {
      formData.append("estado", values.estado)
    }

    if (imageFile) {
      formData.append("image", imageFile)
    }

    try {
      const response = await fetch(
        mode === "create" ? "/api/items" : `/api/items/${itemId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          body: formData,
        },
      )

      if (!response.ok) {
        setErrors({ form: "No se pudo guardar el item." })
        return
      }

      if (mode === "create") {
        router.push("/items")
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
          <Label htmlFor="codigo">Codigo</Label>
          <Input
            id="codigo"
            value={values.codigo}
            onChange={(event) => handleChange("codigo", event.target.value)}
            aria-invalid={Boolean(errors.codigo)}
          />
          {errors.codigo ? (
            <span className="text-sm text-destructive">{errors.codigo}</span>
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
        <div className="flex flex-col gap-1">
          <Label htmlFor="unidadMedida">Unidad de medida</Label>
          <Input
            id="unidadMedida"
            value={values.unidadMedida}
            onChange={(event) => handleChange("unidadMedida", event.target.value)}
            aria-invalid={Boolean(errors.unidadMedida)}
          />
          {errors.unidadMedida ? (
            <span className="text-sm text-destructive">
              {errors.unidadMedida}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <Label htmlFor="descripcion">Descripcion</Label>
          <Textarea
            id="descripcion"
            value={values.descripcion}
            onChange={(event) => handleChange("descripcion", event.target.value)}
            aria-invalid={Boolean(errors.descripcion)}
          />
          {errors.descripcion ? (
            <span className="text-sm text-destructive">
              {errors.descripcion}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="categoriaId">Categoria</Label>
          <select
            id="categoriaId"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none"
            value={values.categoriaId ?? ""}
            onChange={(event) => handleChange("categoriaId", event.target.value)}
          >
            <option value="">Sin categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
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
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="imagen">Imagen (opcional)</Label>
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Vista previa del item"
              className="h-24 w-24 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-neutral-200 text-xs text-neutral-400">
              Sin imagen
            </div>
          )}
          <Input
            id="imagen"
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
          />
          {imageError ? (
            <span className="text-sm text-destructive">{imageError}</span>
          ) : null}
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
