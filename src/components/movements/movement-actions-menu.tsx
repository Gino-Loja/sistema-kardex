"use client"

import { useState } from "react"
import Link from "next/link"
import { IconDotsVertical } from "@tabler/icons-react"

import { MovementDeleteModal } from "@/components/movements/movement-delete-modal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type MovementActionsMenuProps = {
  movementId: string
  movementLabel: string
  estado: string
  canRead?: boolean
  canWrite?: boolean
}

export function MovementActionsMenu({
  movementId,
  movementLabel,
  estado,
  canRead = false,
  canWrite = false,
}: MovementActionsMenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const isBorrador = estado === "borrador"
  const canEdit = canWrite && isBorrador
  const canDelete = canWrite && isBorrador

  if (!canRead && !canWrite) {
    return null
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            aria-label={`Acciones para ${movementLabel}`}
          >
            <IconDotsVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {canRead ? (
            <DropdownMenuItem asChild>
              <Link href={`/movements/${movementId}`}>Ver</Link>
            </DropdownMenuItem>
          ) : null}
          {canEdit ? (
            <DropdownMenuItem asChild>
              <Link href={`/movements/${movementId}/edit`}>Editar</Link>
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => {
                e.preventDefault()
                setDropdownOpen(false)
                setDeleteModalOpen(true)
              }}
            >
              Eliminar
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <MovementDeleteModal
        movementId={movementId}
        movementLabel={movementLabel}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      />
    </>
  )
}
