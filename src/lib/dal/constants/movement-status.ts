export const MOVEMENT_STATUSES = ["borrador", "publicado", "anulado"] as const;
export type MovementStatus = (typeof MOVEMENT_STATUSES)[number];

export const MOVEMENT_STATUS_TRANSITIONS: Record<
  MovementStatus,
  readonly MovementStatus[]
> = {
  borrador: ["publicado"],
  publicado: ["anulado"],
  anulado: [],
};

export const isMovementStatus = (
  value: string | null | undefined,
): value is MovementStatus =>
  !!value && (MOVEMENT_STATUSES as readonly string[]).includes(value);
