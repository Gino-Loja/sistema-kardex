// Types for movement state transitions API responses

export type MovementState = "borrador" | "publicado" | "anulado"

// POST /api/movements/[id]/publish
export interface PublishMovementResponse {
  success: true
  data: {
    id: string
    estado: "publicado"
    updatedAt: string
  }
}

// POST /api/movements/[id]/void
export interface VoidMovementResponse {
  success: true
  data: {
    id: string
    estado: "anulado"
    updatedAt: string
  }
}

// GET /api/item-bodegas/average-costs
export interface AverageCostItem {
  costoPromedio: number
  cantidad: number
  valorTotal: number
}

export interface AverageCostsResponse {
  success: true
  data: {
    bodegaId: string
    costs: Record<string, AverageCostItem>
  }
}

// Error response format (all endpoints)
export interface MovementErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

// Combined response type for type guards
export type PublishMovementResult = PublishMovementResponse | MovementErrorResponse
export type VoidMovementResult = VoidMovementResponse | MovementErrorResponse
export type AverageCostsResult = AverageCostsResponse | MovementErrorResponse

// Type guard helpers
export function isSuccessResponse<T extends { success: boolean }>(
  response: T
): response is T & { success: true } {
  return response.success === true
}

export function isErrorResponse(
  response: { success: boolean }
): response is MovementErrorResponse {
  return response.success === false
}
