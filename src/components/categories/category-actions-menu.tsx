"use client"

import { useState } from "react"
import Link from "next/link"
import { IconDotsVertical } from "@tabler/icons-react"

import { CategoryDeleteModal } from "@/components/categories/category-delete-modal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type CategoryActionsMenuProps = {
  categoryId: string
  categoryLabel: string
  canWrite?: boolean
}

export function CategoryActionsMenu({
  categoryId,
  categoryLabel,
  canWrite = false,
}: CategoryActionsMenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  if (!canWrite) {
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
            aria-label={`Acciones para ${categoryLabel}`}
          >
            <IconDotsVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link href={`/categories/${categoryId}/edit`}>Editar</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault()
              setDropdownOpen(false)
              setDeleteModalOpen(true)
            }}
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CategoryDeleteModal
        categoryId={categoryId}
        categoryLabel={categoryLabel}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      />
    </>
  )
}
