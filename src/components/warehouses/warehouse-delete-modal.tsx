"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type WarehouseDeleteModalProps = {
  bodegaId: string
  bodegaLabel: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function WarehouseDeleteModal({
  bodegaId,
  bodegaLabel,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: WarehouseDeleteModalProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isSubmittingRef = useRef(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  const handleDelete = async () => {
    isSubmittingRef.current = true
    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/bodegas/${bodegaId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        setError("No se pudo eliminar la bodega.")
        return
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError("Ocurrio un error inesperado.")
    } finally {
      setIsDeleting(false)
      isSubmittingRef.current = false
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && (isDeleting || isSubmittingRef.current)) {
          return
        }
        setOpen(nextOpen)
      }}
    >
      {trigger ? (
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
      ) : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar bodega</AlertDialogTitle>
          <AlertDialogDescription>
            Esta accion desactivara la bodega "{bodegaLabel}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault()
              void handleDelete()
            }}
          >
            {isDeleting ? "Eliminando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
