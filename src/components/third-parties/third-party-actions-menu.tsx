"use client"

import { useState } from "react"
import Link from "next/link"
import { IconDotsVertical } from "@tabler/icons-react"

import { ThirdPartyDeleteModal } from "@/components/third-parties/third-party-delete-modal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ThirdPartyActionsMenuProps = {
  terceroId: string
  terceroLabel: string
  canRead?: boolean
  canWrite?: boolean
}

export function ThirdPartyActionsMenu({
  terceroId,
  terceroLabel,
  canRead = false,
  canWrite = false,
}: ThirdPartyActionsMenuProps) {
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
            aria-label={`Acciones para ${terceroLabel}`}
          >
            <IconDotsVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {canRead ? (
            <DropdownMenuItem asChild>
              <Link href={`/third-parties/${terceroId}`}>Ver</Link>
            </DropdownMenuItem>
          ) : null}
          {canWrite ? (
            <DropdownMenuItem asChild>
              <Link href={`/third-parties/${terceroId}/edit`}>Editar</Link>
            </DropdownMenuItem>
          ) : null}
          {canWrite ? (
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
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <ThirdPartyDeleteModal
        terceroId={terceroId}
        terceroLabel={terceroLabel}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      />
    </>
  )
}
