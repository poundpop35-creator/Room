import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getDashboard } from "@/lib/aggregation";

export async function GET(req: NextRequest) {
  const org = req.nextUrl.searchParams.get("organization");
  if (!org) {
    return NextResponse.json({ error: "organization is required" }, { status: 400 });
  }
  const db = getDb();
  const fiscalYearRow = db
    .prepare("SELECT value FROM settings WHERE key = 'fiscal_year'")
    .get() as { value: string };
  return NextResponse.json(getDashboard(db, org, Number(fiscalYearRow.value)));
}
