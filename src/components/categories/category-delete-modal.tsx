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
import { Button } from "@/components/ui/button"

type CategoryDeleteModalProps = {
  categoryId: string
  categoryLabel: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CategoryDeleteModal({
  categoryId,
  categoryLabel,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CategoryDeleteModalProps) {
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
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        if (response.status === 404) {
          setOpen(false)
          return
        }
        setError("No se pudo eliminar la categoria.")
        return
      }

      setOpen(false)
      router.push("/categories?deleted=1")
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
      {trigger && (
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar categoria</AlertDialogTitle>
          <AlertDialogDescription>
            Esta accion eliminara la categoria "{categoryLabel}" y dejara los
            items sin categoria.
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

  return dialog
}
