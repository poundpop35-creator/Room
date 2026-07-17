import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "./db";

// Generic CRUD factory for the "item list" tables (1.1, 2.1-2.5, carryover).
// All of these tables share the same shape: organization_name + a handful of
// free/dropdown fields + optional q1-q4 quarters, keyed by an auto id.

export interface ItemsRouteConfig {
  table: string;
  // Columns accepted from the client on create/update, in addition to organization_name.
  fields: string[];
  // Which of `fields` are numeric (stored as REAL, default 0 if missing).
  numericFields?: string[];
  // If true, row has q1_plan..q4_plan and the API adds a computed total_year.
  hasQuarters?: boolean;
  // If true (investment table), adds a computed `amount` = quantity * unit_price.
  computeAmount?: boolean;
}

function withComputed(row: Record<string, unknown>, cfg: ItemsRouteConfig) {
  const out = { ...row };
  if (cfg.hasQuarters) {
    out.total_year =
      Number(row.q1_plan || 0) +
      Number(row.q2_plan || 0) +
      Number(row.q3_plan || 0) +
      Number(row.q4_plan || 0);
  }
  if (cfg.computeAmount) {
    out.amount = Number(row.quantity || 0) * Number(row.unit_price || 0);
  }
  return out;
}

export function makeCollectionRoute(cfg: ItemsRouteConfig) {
  async function GET(req: NextRequest) {
    const db = getDb();
    const org = req.nextUrl.searchParams.get("organization");
    const rows = org
      ? db
          .prepare(
            `SELECT * FROM ${cfg.table} WHERE organization_name = ? ORDER BY created_at ASC`
          )
          .all(org)
      : db.prepare(`SELECT * FROM ${cfg.table} ORDER BY created_at ASC`).all();
    return NextResponse.json(
      (rows as Record<string, unknown>[]).map((r) => withComputed(r, cfg))
    );
  }

  async function POST(req: NextRequest) {
    const db = getDb();
    const body = await req.json();
    if (!body.organization_name || String(body.organization_name).trim() === "") {
      return NextResponse.json(
        { error: "organization_name is required" },
        { status: 400 }
      );
    }
    const id = randomUUID();
    const cols = ["id", "organization_name", ...cfg.fields];
    const values = cols.map((c) => {
      if (c === "id") return id;
      if (c === "organization_name") return body.organization_name;
      if (cfg.numericFields?.includes(c)) return Number(body[c] ?? 0);
      return body[c] ?? null;
    });
    const placeholders = cols.map(() => "?").join(", ");
    db.prepare(
      `INSERT INTO ${cfg.table} (${cols.join(", ")}) VALUES (${placeholders})`
    ).run(...values);
    const row = db.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).get(id);
    return NextResponse.json(withComputed(row as Record<string, unknown>, cfg), {
      status: 201,
    });
  }

  return { GET, POST };
}

export function makeItemRoute(cfg: ItemsRouteConfig) {
  async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) {
    const { id } = await context.params;
    const db = getDb();
    const body = await req.json();
    const cols = ["organization_name", ...cfg.fields];
    const setClause = cols.map((c) => `${c} = ?`).join(", ");
    const values = cols.map((c) => {
      if (cfg.numericFields?.includes(c)) return Number(body[c] ?? 0);
      return body[c] ?? null;
    });
    const result = db
      .prepare(`UPDATE ${cfg.table} SET ${setClause} WHERE id = ?`)
      .run(...values, id);
    if (result.changes === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const row = db.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).get(id);
    return NextResponse.json(withComputed(row as Record<string, unknown>, cfg));
  }

  async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) {
    const { id } = await context.params;
    const db = getDb();
    const result = db.prepare(`DELETE FROM ${cfg.table} WHERE id = ?`).run(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  return { PUT, DELETE };
}
