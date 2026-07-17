import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAllOrganizations } from "@/lib/aggregation";

export async function GET() {
  const db = getDb();
  return NextResponse.json(getAllOrganizations(db));
}
