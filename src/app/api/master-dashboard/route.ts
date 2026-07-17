import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getMasterDashboard } from "@/lib/aggregation";

export async function GET() {
  const db = getDb();
  const fiscalYearRow = db
    .prepare("SELECT value FROM settings WHERE key = 'fiscal_year'")
    .get() as { value: string };
  return NextResponse.json(getMasterDashboard(db, Number(fiscalYearRow.value)));
}
