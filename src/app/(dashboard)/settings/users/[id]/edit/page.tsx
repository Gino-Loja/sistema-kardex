import Link from "next/link"
import { notFound } from "next/navigation"

import { getUserById } from "@/lib/data/users"
import { getAuthSession } from "@/lib/auth/session"
import { hasPermission } from "@/lib/auth/guards"
import { UserForm } from "@/components/users/user-form"
import { UserDeleteModal } from "@/components/users/user-delete-modal"
import { Button } from "@/components/ui/button"

type UserEditPageProps = {
  params: Promise<{ id: string }>
}

export default async function UserEditPage({ params }: UserEditPageProps) {
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

  const { id } = await params
  const user = await getUserById(id)

  if (!user) {
    notFound()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">Configuracion</p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Editar usuario
          </h1>
          <p className="text-sm text-neutral-600">
            Actualiza la informacion del usuario: {user.name}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/settings/users">Volver</Link>
        </Button>
      </header>

      <UserForm
        mode="edit"
        userId={user.id}
        initialValues={{
          name: user.name,
          email: user.email,
          role: user.role as "admin" | "bodeguero",
          banned: user.banned ?? false,
          banReason: user.banReason ?? ""
        }}
      />

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Zona de peligro
            </h2>
            <p className="text-sm text-neutral-600">
              Acciones irreversibles que afectan permanentemente al usuario.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div>
              <p className="text-sm font-medium text-red-900">
                Eliminar usuario
              </p>
              <p className="text-xs text-red-700">
                Esta accion no se puede deshacer. Todas las sesiones activas
                seran terminadas.
              </p>
            </div>
            <UserDeleteModal
              userId={user.id}
              userLabel={user.name}
              trigger={
                <Button variant="destructive" size="sm">
                  Eliminar
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
