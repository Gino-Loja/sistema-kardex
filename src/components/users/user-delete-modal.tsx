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

type UserDeleteModalProps = {
  userId: string
  userLabel: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UserDeleteModal({
  userId,
  userLabel,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: UserDeleteModalProps) {
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
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()

        if (response.status === 404) {
          setOpen(false)
          return
        }

        let message = "No se pudo eliminar el usuario."
        if (data.error === "CANNOT_DELETE_SELF") {
          message = "No puedes eliminarte a ti mismo."
        } else if (data.error === "CANNOT_DELETE_LAST_ADMIN") {
          message = "No puedes eliminar el ultimo administrador del sistema."
        } else if (response.status === 403) {
          message = "No tienes permisos para eliminar usuarios."
        } else if (response.status === 401) {
          message = "Debes iniciar sesion para continuar."
        }

        setError(message)
        return
      }

      setOpen(false)
      router.push("/settings/users?deleted=1")
      router.refresh()
    } catch (err) {
      setError("Ocurrio un error inesperado.")
    } finally {
      setIsDeleting(false)
      isSubmittingRef.current = false
    }
  }

  const dialog = (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && (isDeleting || isSubmittingRef.current)) {
          return
        }
        setOpen(nextOpen)
      }}
    >
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
          <AlertDialogDescription>
            Esta accion eliminara permanentemente al usuario "{userLabel}" y
            todas sus sesiones activas. Esta accion no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
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

  return dialog
}
