
import { NextResponse } from "next/server";
import { costRecalculationService } from "@/lib/dal/services/cost-recalculation.service";


async function syncCosts(req: Request) {
  const { searchParams } = new URL(req.url);
  const bodegaId = searchParams.get("bodegaId");

  try {
    const result = await costRecalculationService.recalculateCosts({ bodegaId });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

export const GET = syncCosts;
