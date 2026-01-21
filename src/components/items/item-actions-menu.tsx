"use client"

import { useState } from "react"
import Link from "next/link"
import { IconDotsVertical } from "@tabler/icons-react"

import { ItemDeleteModal } from "@/components/items/item-delete-modal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ItemActionsMenuProps = {
  itemId: string
  itemLabel: string
  canRead?: boolean
  canWrite?: boolean
}

export function ItemActionsMenu({
  itemId,
  itemLabel,
  canRead = false,
  canWrite = false,
}: ItemActionsMenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

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
            aria-label={`Acciones para ${itemLabel}`}
          >
            <IconDotsVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {canRead ? (
            <DropdownMenuItem asChild>
              <Link href={`/items/${itemId}`}>Ver</Link>
            </DropdownMenuItem>
          ) : null}
          {canWrite ? (
            <DropdownMenuItem asChild>
              <Link href={`/items/${itemId}/edit`}>Actualizar</Link>
            </DropdownMenuItem>
          ) : null}
          {canWrite ? (
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

      <ItemDeleteModal
        itemId={itemId}
        itemLabel={itemLabel}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      />
    </>
  )
}