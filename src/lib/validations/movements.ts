import { z } from "zod";
import {
  dateSchema,
  idSchema,
  nonEmptyStringSchema,
  optionalIdSchema,
  positiveNumberSchema,
} from "./common";

export const movimientoTipoSchema = z.enum([
  "entrada",
  "salida",
  "transferencia",
  "ajuste",
]);

export const movimientoDetalleSchema = z.object({
  itemId: idSchema,
  cantidad: positiveNumberSchema,
  costoUnitario: positiveNumberSchema.optional(),
});

// Base schema without refinements (for use with .partial())
const movimientoBaseSchema = z.object({
  tipo: movimientoTipoSchema,
  fecha: dateSchema,
  bodegaOrigenId: optionalIdSchema,
  bodegaDestinoId: optionalIdSchema,
  terceroId: optionalIdSchema,
  observacion: nonEmptyStringSchema.optional(),
  detalles: z.array(movimientoDetalleSchema).min(1),
});

// Refinement function for conditional validation
const movimientoRefinement = (data: z.infer<typeof movimientoBaseSchema>, ctx: z.RefinementCtx) => {
  if (data.tipo === "entrada" && !data.bodegaDestinoId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Bodega destino requerida",
      path: ["bodegaDestinoId"],
    });
  }

  if (data.tipo === "salida" && !data.bodegaOrigenId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Bodega origen requerida",
      path: ["bodegaOrigenId"],
    });
  }

  if (data.tipo === "transferencia") {
    if (!data.bodegaOrigenId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bodega origen requerida",
        path: ["bodegaOrigenId"],
      });
    }
    if (!data.bodegaDestinoId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bodega destino requerida",
        path: ["bodegaDestinoId"],
      });
    }
  }
};

export const movimientoCreateSchema = movimientoBaseSchema.superRefine(movimientoRefinement);

export const movimientoUpdateSchema = movimientoBaseSchema.partial().extend({
  id: idSchema,
});

export const movimientoPublishSchema = z.object({
  movimientoId: idSchema,
  motivo: nonEmptyStringSchema.optional(),
  permitirNegativo: z.boolean().optional(),
});

export type MovimientoCreateInput = z.infer<typeof movimientoCreateSchema>;
export type MovimientoUpdateInput = z.infer<typeof movimientoUpdateSchema>;
export type MovimientoPublishInput = z.infer<typeof movimientoPublishSchema>;
