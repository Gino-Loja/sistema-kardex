import Link from 'next/link'
import type { User } from '@/lib/types/users'

type UserListTableProps = {
  users: User[]
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-EC', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

export function UserListTable({ users }: UserListTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Vista móvil (cards) */}
      <div className="md:hidden">
        <div className="divide-y divide-neutral-100">
          {users.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-neutral-500">
              Aun no hay usuarios registrados.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 px-4 py-4 text-sm text-neutral-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-medium text-neutral-900">
                      {user.name}
                    </div>
                    <div className="truncate text-xs text-neutral-500">
                      {user.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <Link
                      href={`/settings/users/${user.id}/edit`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
                <div className="grid gap-1 text-xs text-neutral-500">
                  <div className="flex items-center justify-between gap-4">
                    <span>Rol</span>
                    <span className="capitalize text-right text-neutral-700">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Estado</span>
                    <span className="text-right text-neutral-700">
                      {user.banned ? (
                        <span className="text-red-600 font-medium">Bloqueado</span>
                      ) : (
                        <span className="text-green-600">Activo</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Creado</span>
                    <span className="text-right text-neutral-700">
                      {dateTimeFormatter.format(user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Vista escritorio (tabla con scroll horizontal) */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-[200px_240px_140px_120px_160px_100px] gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-500">
            <span>Nombre</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Estado</span>
            <span>Creado</span>
            <span className="text-right">Accion</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {users.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-neutral-500">
                Aun no hay usuarios registrados.
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-[200px_240px_140px_120px_160px_100px] gap-4 px-4 py-3 text-sm text-neutral-700"
                >
                  <span className="font-medium text-neutral-900">{user.name}</span>
                  <span className="text-neutral-600">{user.email}</span>
                  <span className="capitalize text-neutral-600">{user.role}</span>
                  <span className="text-neutral-600">
                    {user.banned ? (
                      <span className="text-red-600 font-medium">Bloqueado</span>
                    ) : (
                      <span className="text-green-600">Activo</span>
                    )}
                  </span>
                  <span className="text-neutral-600">
                    {dateTimeFormatter.format(user.createdAt)}
                  </span>
                  <div className="text-right">
                    <Link
                      href={`/settings/users/${user.id}/edit`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
