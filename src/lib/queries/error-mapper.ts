import { ZodError } from "zod";

export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "INVALID_QUANTITY"
  | "INVALID_COST"
  | "INSUFFICIENT_STOCK"
  | "INTERNAL";

export type ErrorResponse = {
  code: ErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

const KNOWN_ERRORS: Record<string, Omit<ErrorResponse, "details">> = {
  UNAUTHENTICATED: {
    code: "UNAUTHENTICATED",
    message: "UNAUTHENTICATED",
    status: 401,
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    message: "FORBIDDEN",
    status: 403,
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    message: "NOT_FOUND",
    status: 404,
  },
  CONFLICT: {
    code: "CONFLICT",
    message: "CONFLICT",
    status: 409,
  },
  INVALID_QUANTITY: {
    code: "INVALID_QUANTITY",
    message: "INVALID_QUANTITY",
    status: 400,
  },
  INVALID_COST: {
    code: "INVALID_COST",
    message: "INVALID_COST",
    status: 400,
  },
  INSUFFICIENT_STOCK: {
    code: "INSUFFICIENT_STOCK",
    message: "INSUFFICIENT_STOCK",
    status: 409,
  },
};

export const mapError = (error: unknown): ErrorResponse => {
  if (error instanceof ZodError) {
    return {
      code: "VALIDATION",
      message: "VALIDATION",
      status: 400,
      details: error.flatten(),
    };
  }

  if (error instanceof Error) {
    const known = KNOWN_ERRORS[error.message];

    if (known) {
      return known;
    }
  }

  return {
    code: "INTERNAL",
    message: "INTERNAL",
    status: 500,
  };
};
