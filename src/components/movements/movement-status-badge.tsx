"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      status: {
        borrador: "bg-gray-50 text-gray-600 ring-gray-500/20",
        publicado: "bg-green-50 text-green-700 ring-green-600/20",
        anulado: "bg-red-50 text-red-700 ring-red-600/20",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        md: "px-2 py-1 text-sm",
        lg: "px-2.5 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      status: "borrador",
      size: "sm",
    },
  }
)

const statusLabels: Record<string, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  anulado: "Anulado",
}

const statusIcons: Record<string, React.ReactNode> = {
  borrador: (
    <svg
      className="h-3 w-3"
      viewBox="0 0 6 6"
      aria-hidden="true"
    >
      <circle cx={3} cy={3} r={3} fill="currentColor" opacity={0.4} />
    </svg>
  ),
  publicado: (
    <svg
      className="h-3 w-3"
      viewBox="0 0 6 6"
      aria-hidden="true"
    >
      <circle cx={3} cy={3} r={3} fill="currentColor" />
    </svg>
  ),
  anulado: (
    <svg
      className="h-3 w-3"
      viewBox="0 0 6 6"
      aria-hidden="true"
    >
      <circle cx={3} cy={3} r={3} fill="currentColor" />
    </svg>
  ),
}

export type MovementStatus = "borrador" | "publicado" | "anulado"

export interface MovementStatusBadgeProps
  extends VariantProps<typeof statusBadgeVariants> {
  status: MovementStatus
  showIcon?: boolean
  className?: string
}

export function MovementStatusBadge({
  status,
  size,
  showIcon = true,
  className,
}: MovementStatusBadgeProps) {
  const label = statusLabels[status] ?? status
  const icon = statusIcons[status]

  return (
    <span
      className={cn(statusBadgeVariants({ status, size }), className)}
      role="status"
      aria-label={`Estado: ${label}`}
    >
      {showIcon && icon}
      {label}
    </span>
  )
}
