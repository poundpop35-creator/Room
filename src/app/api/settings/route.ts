import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'fiscal_year'")
    .get() as { value: string };
  return NextResponse.json({ fiscal_year: Number(row.value) });
}

export async function PUT(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const year = Number(body.fiscal_year);
  if (!Number.isFinite(year) || year < 2500 || year > 2700) {
    return NextResponse.json({ error: "invalid fiscal_year" }, { status: 400 });
  }
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('fiscal_year', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(String(year));
  return NextResponse.json({ fiscal_year: year });
}
