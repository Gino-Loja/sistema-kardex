import Link from "next/link"

import { getAuthSession } from "@/lib/auth/session"
import { hasPermission } from "@/lib/auth/guards"
import { UserForm } from "@/components/users/user-form"
import { Button } from "@/components/ui/button"

export default async function UserCreatePage() {
  // Check permissions
  const session = await getAuthSession()
  const role = session?.user?.role

  if (!hasPermission(role, 'users:manage')) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
          No tienes permisos para gestionar usuarios.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Configuracion</p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Crear usuario
          </h1>
          <p className="text-sm text-neutral-600">
            Registra un nuevo usuario con acceso al sistema.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/settings/users">Volver</Link>
        </Button>
      </header>

      <UserForm mode="create" />
    </div>
  )
}
