import { notFound } from "next/navigation"

import { getAuthSession } from "@/lib/auth/session"
import { hasPermission, hasRole } from "@/lib/auth/guards"
import { getBodegaDetail } from "@/lib/data/bodegas"
import { WarehouseDetailHeader } from "@/components/warehouses/warehouse-detail-header"
import { WarehouseItemAssignment } from "@/components/warehouses/warehouse-item-assignment"
import { WarehouseItemsTable } from "@/components/warehouses/warehouse-items-table"

import { WarehouseCostModeToggle } from "@/components/warehouses/warehouse-cost-mode-toggle"

type WarehouseDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function WarehouseDetailPage({ params }: WarehouseDetailPageProps) {
  const { id } = await params
  const bodega = await getBodegaDetail(id)

  if (!bodega) {
    notFound()
  }

  const session = await getAuthSession()
  const role = session?.user?.role
  const canEdit = hasRole(role, "admin")
  const canAssign = hasPermission(role, "masters:write")

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <WarehouseDetailHeader bodega={bodega} canEdit={canEdit} />

      <WarehouseCostModeToggle
        warehouseId={bodega.id}
        initialChecked={bodega.auto_update_average_cost}
      />

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-neutral-900">
            Items asignados
          </h2>
          <WarehouseItemAssignment
            bodegaId={bodega.id}
            bodegaEstado={bodega.estado}
            assignedItemIds={bodega.items.map((item) => item.itemId)}
            canAssign={canAssign}
          />
        </div>
        <WarehouseItemsTable bodegaId={bodega.id} canWrite={canAssign} />
      </section>
    </div>
  )
}
