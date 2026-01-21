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

type MovementDeleteModalProps = {
  movementId: string
  movementLabel: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MovementDeleteModal({
  movementId,
  movementLabel,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: MovementDeleteModalProps) {
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
      const response = await fetch(`/api/movements/${movementId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (data.error === "NOT_DELETABLE") {
          setError("Este movimiento no puede ser eliminado porque no está en estado borrador.")
        } else {
          setError("No se pudo eliminar el movimiento.")
        }
        return
      }

      setOpen(false)
      router.push("/movements")
      router.refresh()
    } catch {
      setError("Ocurrió un error inesperado.")
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
          <AlertDialogTitle>Eliminar movimiento</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará el movimiento "{movementLabel}" y todos sus detalles asociados.
            Esta operación no se puede deshacer.
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
            {isDeleting ? "Eliminando..." : "Confirmar eliminación"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
