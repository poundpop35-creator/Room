import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { DEFAULT_FISCAL_YEAR } from "./constants";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "budget.db");

declare global {
  var __budgetDb: Database.Database | undefined;
}

function createDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- 1.1 รายรับปีปัจจุบัน
    CREATE TABLE IF NOT EXISTS revenue_current_year_items (
      id TEXT PRIMARY KEY,
      organization_name TEXT NOT NULL,
      category TEXT NOT NULL,
      item_name TEXT NOT NULL,
      q1_plan REAL NOT NULL DEFAULT 0,
      q2_plan REAL NOT NULL DEFAULT 0,
      q3_plan REAL NOT NULL DEFAULT 0,
      q4_plan REAL NOT NULL DEFAULT 0,
      responsible TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 1. ภาพรวมรายรับ (forecast only; year_current is computed from items)
    CREATE TABLE IF NOT EXISTS revenue_yearly_overview (
      id TEXT PRIMARY KEY,
      organization_name TEXT NOT NULL,
      category TEXT NOT NULL,
      forecast_year1 REAL NOT NULL DEFAULT 0,
      forecast_year2 REAL NOT NULL DEFAULT 0,
      forecast_year3 REAL NOT NULL DEFAULT 0,
      responsible TEXT,
      note TEXT,
      UNIQUE(organization_name, category)
    );

    -- 2.1 รายจ่ายบุคลากร
    CREATE TABLE IF NOT EXISTS expense_personnel_items (
      id TEXT PRIMARY KEY,
      organization_name TEXT NOT NULL,
      employee_name TEXT,
      subcategory TEXT NOT NULL,
      item_name TEXT NOT NULL,
      q1_plan REAL NOT NULL DEFAULT 0,
      q2_plan REAL NOT NULL DEFAULT 0,
      q3_plan REAL NOT NULL DEFAULT 0,
      q4_plan REAL NOT NULL DEFAULT 0,
      responsible TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 2.2 รายจ่ายพื้นฐาน
    CREATE TABLE IF NOT EXISTS expense_basic_items (
      id TEXT PRIMARY KEY,
      organization_name TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      item_name TEXT NOT NULL,
      q1_plan REAL NOT NULL DEFAULT 0,
      q2_plan REAL NOT NULL DEFAULT 0,
      q3_plan REAL NOT NULL DEFAULT 0,
      q4_plan REAL NOT NULL DEFAULT 0,
      responsible TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 2.3 รายจ่ายบริการ
    CREATE TABLE IF NOT EXISTS expense_service_items (
      id TEXT PRIMARY KEY,
      organization_name TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      item_name TEXT NOT NULL,
      q1_plan REAL NOT NULL DEFAULT 0,
      q2_plan REAL NOT NULL DEFAULT 0,
      q3_plan REAL NOT NULL DEFAULT 0,
      q4_plan REAL NOT NULL DEFAULT 0,
      responsible TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 2.4 รายจ่ายขับเคลื่อน (โครงการ)
    CREATE TABLE IF NOT EXISTS expense_project_items (
      id TEXT PRIMARY KEY,
      organization_name TEXT NOT NULL,
      project_name TEXT NOT NULL,
      item_name TEXT NOT NULL,
      q1_plan REAL NOT NULL DEFAULT 0,
      q2_plan REAL NOT NULL DEFAULT 0,
      q3_plan REAL NOT NULL DEFAULT 0,
      q4_plan REAL NOT NULL DEFAULT 0,
      reason TEXT,
      expected_output TEXT,
      responsible TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 2.5 รายจ่ายลงทุน
    CREATE TABLE IF NOT EXISTS expense_investment_items (
      id TEXT PRIMARY KEY,
      organization_name TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      equipment_type TEXT,
      item_name TEXT NOT NULL,
      unit TEXT,
      quantity REAL,
      unit_price REAL,
      q1_plan REAL NOT NULL DEFAULT 0,
      q2_plan REAL NOT NULL DEFAULT 0,
      q3_plan REAL NOT NULL DEFAULT 0,
      q4_plan REAL NOT NULL DEFAULT 0,
      responsible TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 2. ภาพรวมรายจ่าย (forecast only; year_current is computed from items)
    CREATE TABLE IF NOT EXISTS expense_yearly_overview (
      id TEXT PRIMARY KEY,
      organization_name TEXT NOT NULL,
      category TEXT NOT NULL,
      forecast_year1 REAL NOT NULL DEFAULT 0,
      forecast_year2 REAL NOT NULL DEFAULT 0,
      forecast_year3 REAL NOT NULL DEFAULT 0,
      responsible TEXT,
      note TEXT,
      UNIQUE(organization_name, category)
    );

    -- รายการเบิกจ่ายไม่ทันจากปีก่อน
    CREATE TABLE IF NOT EXISTS carryover_items (
      id TEXT PRIMARY KEY,
      organization_name TEXT NOT NULL,
      item_name TEXT NOT NULL,
      committed_amount REAL NOT NULL DEFAULT 0,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const fiscalYearRow = db
    .prepare("SELECT value FROM settings WHERE key = 'fiscal_year'")
    .get();
  if (!fiscalYearRow) {
    db.prepare("INSERT INTO settings (key, value) VALUES ('fiscal_year', ?)").run(
      String(DEFAULT_FISCAL_YEAR)
    );
  }

  return db;
}

export function getDb(): Database.Database {
  if (!global.__budgetDb) {
    global.__budgetDb = createDb();
  }
  return global.__budgetDb;
}
