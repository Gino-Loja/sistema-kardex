import Link from 'next/link'
import type { SearchParams } from 'nuqs/server'

import { listUsers } from '@/lib/data/users'
import { getAuthSession } from '@/lib/auth/session'
import { hasPermission } from '@/lib/auth/guards'
import { userListQuerySchema } from '@/lib/validators/user'
import { UserFilters } from '@/components/users/user-filters'
import { UserListTable } from '@/components/users/user-list-table'
import { Button } from '@/components/ui/button'
import { loadUsersSearchParams } from './search-params'

type UsersPageProps = {
  searchParams: Promise<SearchParams>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const resolvedSearchParams = await loadUsersSearchParams(searchParams)
  const rawQuery = {
    page: resolvedSearchParams.page,
    pageSize: resolvedSearchParams.pageSize,
    search: resolvedSearchParams.search ?? undefined,
    status: resolvedSearchParams.status ?? undefined
  }

  const parsed = userListQuerySchema.safeParse(rawQuery)
  const query = parsed.success ? parsed.data : { page: 1, pageSize: 20 }

  // Check permissions
  const session = await getAuthSession()
  const role = session?.user?.role

  if (!hasPermission(role, 'users:manage')) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
          No tienes permisos para gestionar usuarios.
        </div>
      </div>
    )
  }

  const { users, total, page, pageSize } = await listUsers(query)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = Boolean(rawQuery.search || rawQuery.status)

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams()

    if (rawQuery.search) params.set('search', rawQuery.search)
    if (rawQuery.status) params.set('status', rawQuery.status)
    if (rawQuery.pageSize) params.set('pageSize', String(rawQuery.pageSize))
    params.set('page', String(nextPage))

    return `/settings/users?${params.toString()}`
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-neutral-500">Configuracion</p>
            <h1 className="text-3xl font-semibold text-neutral-900">Usuarios</h1>
            <p className="text-sm text-neutral-600">
              Gestiona cuentas de usuario y permisos de acceso al sistema.
            </p>
          </div>
          <Button asChild>
            <Link href="/settings/users/create">Nuevo usuario</Link>
          </Button>
        </div>
        <UserFilters />
      </header>

      <section className="flex flex-col gap-3">
        <UserListTable users={users} />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500">
          <span>
            Mostrando pagina {page} de {totalPages} · {total} usuarios
          </span>
          <div className="flex items-center gap-2">
            {page <= 1 ? (
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href={buildPageHref(page - 1)}>Anterior</Link>
              </Button>
            )}
            {page >= totalPages ? (
              <Button variant="outline" size="sm" disabled>
                Siguiente
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href={buildPageHref(page + 1)}>Siguiente</Link>
              </Button>
            )}
          </div>
        </div>
        {users.length === 0 && hasFilters ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
            No hay resultados con los filtros actuales.
          </div>
        ) : null}
      </section>
    </div>
  )
}

