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
import type { MovementState } from "@/lib/types/movements"

type MovementActionButtonsProps = {
  movementId: string
  estado: MovementState
  onSuccess?: () => void
}

export function MovementActionButtons({
  movementId,
  estado,
  onSuccess,
}: MovementActionButtonsProps) {
  const router = useRouter()
  const [publishOpen, setPublishOpen] = useState(false)
  const [voidOpen, setVoidOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isSubmittingRef = useRef(false)

  const handlePublish = async () => {
    isSubmittingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/movements/${movementId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.code === "NOT_EDITABLE") {
          setError("Solo se pueden publicar movimientos en estado borrador.")
        } else if (data.error?.code === "STOCK_INSUFFICIENT") {
          setError(data.error?.message ?? "Stock insuficiente para completar el movimiento.")
        } else {
          setError(data.error?.message ?? "No se pudo publicar el movimiento.")
        }
        return
      }

      setPublishOpen(false)
      router.refresh()
      onSuccess?.()
    } catch {
      setError("Ocurrió un error inesperado.")
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  const handleVoid = async () => {
    isSubmittingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/movements/${movementId}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.code === "NOT_VOIDABLE") {
          setError("Solo se pueden anular movimientos publicados.")
        } else {
          setError(data.error?.message ?? "No se pudo anular el movimiento.")
        }
        return
      }

      setVoidOpen(false)
      router.refresh()
      onSuccess?.()
    } catch {
      setError("Ocurrió un error inesperado.")
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  const handleDialogChange = (
    nextOpen: boolean,
    setOpen: (open: boolean) => void
  ) => {
    if (!nextOpen && (isLoading || isSubmittingRef.current)) {
      return
    }
    if (!nextOpen) {
      setError(null)
    }
    setOpen(nextOpen)
  }

  if (estado === "anulado") {
    return null
  }

  return (
    <div className="flex gap-2">
      {estado === "borrador" && (
        <AlertDialog
          open={publishOpen}
          onOpenChange={(nextOpen) => handleDialogChange(nextOpen, setPublishOpen)}
        >
          <AlertDialogTrigger asChild>
            <Button variant="default" className="bg-green-600 hover:bg-green-700">
              Publicar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Publicar movimiento</AlertDialogTitle>
              <AlertDialogDescription>
                Al publicar este movimiento se aplicarán los cambios al inventario.
                El stock se actualizará y el movimiento ya no podrá ser editado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
                onClick={(event) => {
                  event.preventDefault()
                  void handlePublish()
                }}
              >
                {isLoading ? "Publicando..." : "Confirmar publicación"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {estado === "publicado" && (
        <AlertDialog
          open={voidOpen}
          onOpenChange={(nextOpen) => handleDialogChange(nextOpen, setVoidOpen)}
        >
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              Anular
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Anular movimiento</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <span className="block">
                  Al anular este movimiento se revertirán los cambios en el inventario.
                </span>
                <span className="block font-medium text-amber-600">
                  Advertencia: Esta acción afectará el stock de los ítems involucrados.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
                onClick={(event) => {
                  event.preventDefault()
                  void handleVoid()
                }}
              >
                {isLoading ? "Anulando..." : "Confirmar anulación"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
