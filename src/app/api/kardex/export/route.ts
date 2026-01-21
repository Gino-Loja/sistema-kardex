import { NextResponse } from "next/server";

import { getKardexCsvData, getItemInfo } from "@/lib/data/kardex";
import { getAuthSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/guards";
import { kardexExportQuerySchema } from "@/lib/validators/kardex";

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

const requireKardexPermission = async () => {
  try {
    const session = await getAuthSession();
    const user = requirePermission(session, "movements:read");
    return { user, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    if (message === "FORBIDDEN") {
      return { user: null, error: errorResponse("FORBIDDEN", 403) };
    }
    return { user: null, error: errorResponse("UNAUTHENTICATED", 401) };
  }
};

/**
 * Escapes a CSV value (handles commas, quotes, newlines)
 */
function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Converts rows to CSV string
 */
function toCsv(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCsvValue).join(",");
  const dataLines = rows.map((row) => row.map(escapeCsvValue).join(","));
  return [headerLine, ...dataLines].join("\n");
}

export async function GET(request: Request) {
  const { error } = await requireKardexPermission();
  if (error) {
    return error;
  }

  const { searchParams } = new URL(request.url);
  const parsed = kardexExportQuerySchema.safeParse({
    itemId: searchParams.get("itemId") ?? undefined,
    bodegaId: searchParams.get("bodegaId") ?? undefined,
    fechaDesde: searchParams.get("fechaDesde") ?? undefined,
    fechaHasta: searchParams.get("fechaHasta") ?? undefined,
    tipo: searchParams.get("tipo") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { headers, rows } = await getKardexCsvData(parsed.data);
    const csvContent = toCsv(headers, rows);

    // Get item info for filename
    const itemInfo = await getItemInfo(parsed.data.itemId);
    const itemCode = itemInfo?.codigo ?? "ITEM";
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `kardex-${itemCode}-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "EXPORT_FAILED";

    if (message === "ITEM_NOT_FOUND") {
      return errorResponse("ITEM_NOT_FOUND", 404);
    }

    return errorResponse(message, 500);
  }
}
