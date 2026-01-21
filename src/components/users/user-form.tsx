"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth/auth-client"

type UserFormValues = {
  name: string
  email: string
  password: string
  role: "admin" | "bodeguero"
  banned: boolean
  banReason: string
}

type UserFormProps = {
  mode: "create" | "edit"
  userId?: string
  initialValues?: Partial<UserFormValues>
}

export function UserForm({ mode, userId, initialValues }: UserFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<UserFormValues>({
    name: initialValues?.name ?? "",
    email: initialValues?.email ?? "",
    password: "",
    role: initialValues?.role ?? "bodeguero",
    banned: initialValues?.banned ?? false,
    banReason: initialValues?.banReason ?? ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (key: keyof UserFormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!values.name.trim()) {
      nextErrors.name = "El nombre es obligatorio."
    }

    if (!values.email.trim()) {
      nextErrors.email = "El email es obligatorio."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = "El email no es valido."
    }

    if (mode === "create" && !values.password) {
      nextErrors.password = "La contrasena es obligatoria."
    } else if (mode === "create" && values.password.length < 8) {
      nextErrors.password = "La contrasena debe tener al menos 8 caracteres."
    }

    if (values.banned && !values.banReason.trim()) {
      nextErrors.banReason = "Debes proporcionar una razon para bloquear al usuario."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submitLabel = useMemo(
    () => (mode === "create" ? "Crear usuario" : "Guardar cambios"),
    [mode]
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    if (mode === "edit" && !userId) {
      setErrors({ form: "No se encontro el usuario." })
      return
    }

    setIsSubmitting(true)

    try {
      const payload: Record<string, unknown> = {
        name: values.name.trim(),
        email: values.email.trim(),
        role: values.role
      }

      if (mode === "create") {
        payload.password = values.password
      }

      if (mode === "edit") {
        payload.banned = values.banned
        if (values.banned) {
          payload.banReason = values.banReason.trim()
        }
      }

      const response = await fetch(
        mode === "create" ? "/api/users" : `/api/users/${userId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const data = await response.json()
        const fallback =
          mode === "create"
            ? "No se pudo crear el usuario."
            : "No se pudo actualizar el usuario."

        let message = fallback
        if (data.error === "EMAIL_EXISTS") {
          message = "Ya existe un usuario con ese email."
        } else if (data.error === "CANNOT_BAN_SELF") {
          message = "No puedes bloquearte a ti mismo."
        } else if (data.error === "VALIDATION_ERROR") {
          message = "Los datos proporcionados no son validos."
        } else if (response.status === 403) {
          message = "No tienes permisos para realizar esta accion."
        } else if (response.status === 401) {
          message = "Debes iniciar sesion para continuar."
        }

        setErrors({ form: message })
        return
      }

      if (mode === "create") {
        router.push("/settings/users")
      } else {
        // Refrescar la sesión del cliente para que el sidebar se actualice
        await authClient.getSession()
        router.refresh()
        router.push("/settings/users")
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
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={isSubmitting}
          />
          {errors.name ? (
            <span className="text-xs text-red-600">{errors.name}</span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={isSubmitting}
          />
          {errors.email ? (
            <span className="text-xs text-red-600">{errors.email}</span>
          ) : null}
        </div>
      </div>

      {mode === "create" ? (
        <div className="flex flex-col gap-1">
          <Label htmlFor="password">Contrasena</Label>
          <Input
            id="password"
            type="password"
            value={values.password}
            onChange={(e) => handleChange("password", e.target.value)}
            disabled={isSubmitting}
          />
          {errors.password ? (
            <span className="text-xs text-red-600">{errors.password}</span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <Label htmlFor="role">Rol</Label>
        <select
          id="role"
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-10 rounded-lg border bg-transparent px-3 text-sm outline-none disabled:opacity-50"
          value={values.role}
          onChange={(e) => handleChange("role", e.target.value)}
          disabled={isSubmitting}
        >
          <option value="bodeguero">Bodeguero</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      {mode === "edit" ? (
        <>
          <div className="flex items-center gap-2">
            <input
              id="banned"
              type="checkbox"
              checked={values.banned}
              onChange={(e) => handleChange("banned", e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-neutral-300"
            />
            <Label htmlFor="banned" className="cursor-pointer">
              Usuario bloqueado
            </Label>
          </div>

          {values.banned ? (
            <div className="flex flex-col gap-1">
              <Label htmlFor="banReason">Razon del bloqueo</Label>
              <Input
                id="banReason"
                value={values.banReason}
                onChange={(e) => handleChange("banReason", e.target.value)}
                disabled={isSubmitting}
                placeholder="Especifica por que se bloquea al usuario"
              />
              {errors.banReason ? (
                <span className="text-xs text-red-600">{errors.banReason}</span>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

      {errors.form ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.form}
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
