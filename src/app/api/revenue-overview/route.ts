import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getRevenueOverview } from "@/lib/aggregation";

export async function GET(req: NextRequest) {
  const org = req.nextUrl.searchParams.get("organization");
  if (!org) {
    return NextResponse.json({ error: "organization is required" }, { status: 400 });
  }
  const db = getDb();
  return NextResponse.json(getRevenueOverview(db, org));
}

// Upserts the editable forecast (year1-3, responsible, note) for one category.
// year_current is never accepted from the client — it is always derived from 1.1.
export async function PUT(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { organization_name, category, forecast_year1, forecast_year2, forecast_year3, responsible, note } = body;
  if (!organization_name || !category) {
    return NextResponse.json(
      { error: "organization_name and category are required" },
      { status: 400 }
    );
  }
  db.prepare(
    `INSERT INTO revenue_yearly_overview (id, organization_name, category, forecast_year1, forecast_year2, forecast_year3, responsible, note)
     VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(organization_name, category) DO UPDATE SET
       forecast_year1 = excluded.forecast_year1,
       forecast_year2 = excluded.forecast_year2,
       forecast_year3 = excluded.forecast_year3,
       responsible = excluded.responsible,
       note = excluded.note`
  ).run(
    organization_name,
    category,
    Number(forecast_year1 || 0),
    Number(forecast_year2 || 0),
    Number(forecast_year3 || 0),
    responsible ?? null,
    note ?? null
  );
  const rows = getRevenueOverview(db, organization_name);
  return NextResponse.json(rows.find((r) => r.category === category));
}
