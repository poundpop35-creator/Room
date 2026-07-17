import Database from "better-sqlite3";
import {
  REVENUE_CATEGORIES,
  EXPENSE_OVERVIEW_CATEGORIES,
} from "./constants";

function sumQuarters(db: Database.Database, table: string, where: string, arg: string) {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(q1_plan + q2_plan + q3_plan + q4_plan), 0) AS total FROM ${table} WHERE ${where}`
    )
    .get(arg) as { total: number };
  return row.total;
}

// สเปก 2. กฎการคำนวณ — maps each expense_yearly_overview category to its source table/filter.
function expenseYearCurrent(
  db: Database.Database,
  org: string,
  category: string
): number {
  switch (category) {
    case "รายจ่ายบุคลากร":
      return sumQuarters(
        db,
        "expense_personnel_items",
        "organization_name = ?",
        org
      );
    case "รายจ่ายดำเนินงาน - งานพื้นฐาน":
      return sumQuarters(db, "expense_basic_items", "organization_name = ?", org);
    case "รายจ่ายดำเนินงาน - งานบริการ":
      return sumQuarters(
        db,
        "expense_service_items",
        "organization_name = ?",
        org
      );
    case "รายจ่ายดำเนินงาน - งานโครงการขับเคลื่อน":
      return sumQuarters(
        db,
        "expense_project_items",
        "organization_name = ?",
        org
      );
    case "รายจ่ายลงทุน - ที่ดินและสิ่งก่อสร้าง":
      return sumInvestment(db, org, "ที่ดินและสิ่งก่อสร้าง");
    case "รายจ่ายลงทุน - ครุภัณฑ์":
      return sumInvestment(db, org, "ครุภัณฑ์");
    case "รายจ่ายลงทุน - อื่นๆ":
      return sumInvestment(db, org, "อื่นๆ");
    default:
      return 0;
  }
}

function sumInvestment(db: Database.Database, org: string, subcategory: string) {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(q1_plan + q2_plan + q3_plan + q4_plan), 0) AS total FROM expense_investment_items WHERE organization_name = ? AND subcategory = ?`
    )
    .get(org, subcategory) as { total: number };
  return row.total;
}

function revenueYearCurrent(
  db: Database.Database,
  org: string,
  category: string
): number {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(q1_plan + q2_plan + q3_plan + q4_plan), 0) AS total FROM revenue_current_year_items WHERE organization_name = ? AND category = ?`
    )
    .get(org, category) as { total: number };
  return row.total;
}

interface OverviewRow {
  organization_name: string;
  category: string;
  year_current: number;
  forecast_year1: number;
  forecast_year2: number;
  forecast_year3: number;
  responsible: string | null;
  note: string | null;
}

export function getRevenueOverview(
  db: Database.Database,
  org: string
): OverviewRow[] {
  return REVENUE_CATEGORIES.map((category) => {
    const forecastRow = db
      .prepare(
        `SELECT forecast_year1, forecast_year2, forecast_year3, responsible, note FROM revenue_yearly_overview WHERE organization_name = ? AND category = ?`
      )
      .get(org, category) as
      | Pick<
          OverviewRow,
          "forecast_year1" | "forecast_year2" | "forecast_year3" | "responsible" | "note"
        >
      | undefined;
    return {
      organization_name: org,
      category,
      year_current: revenueYearCurrent(db, org, category),
      forecast_year1: forecastRow?.forecast_year1 ?? 0,
      forecast_year2: forecastRow?.forecast_year2 ?? 0,
      forecast_year3: forecastRow?.forecast_year3 ?? 0,
      responsible: forecastRow?.responsible ?? null,
      note: forecastRow?.note ?? null,
    };
  });
}

export function getExpenseOverview(
  db: Database.Database,
  org: string
): OverviewRow[] {
  return EXPENSE_OVERVIEW_CATEGORIES.map((category) => {
    const forecastRow = db
      .prepare(
        `SELECT forecast_year1, forecast_year2, forecast_year3, responsible, note FROM expense_yearly_overview WHERE organization_name = ? AND category = ?`
      )
      .get(org, category) as
      | Pick<
          OverviewRow,
          "forecast_year1" | "forecast_year2" | "forecast_year3" | "responsible" | "note"
        >
      | undefined;
    return {
      organization_name: org,
      category,
      year_current: expenseYearCurrent(db, org, category),
      forecast_year1: forecastRow?.forecast_year1 ?? 0,
      forecast_year2: forecastRow?.forecast_year2 ?? 0,
      forecast_year3: forecastRow?.forecast_year3 ?? 0,
      responsible: forecastRow?.responsible ?? null,
      note: forecastRow?.note ?? null,
    };
  });
}

export interface DashboardData {
  organization_name: string;
  fiscal_year: number;
  revenue: { category: string; amount: number }[];
  revenue_total: number;
  expense: { category: string; amount: number }[];
  expense_total: number;
  carryover: { id: string; item_name: string; committed_amount: number; note: string | null }[];
  carryover_total: number;
}

export function getDashboard(
  db: Database.Database,
  org: string,
  fiscalYear: number
): DashboardData {
  const revenueRows = getRevenueOverview(db, org);
  const revenue = revenueRows.map((r) => ({
    category: r.category,
    amount: r.year_current,
  }));
  const revenue_total = revenue.reduce((s, r) => s + r.amount, 0);

  const expenseRows = getExpenseOverview(db, org);
  const personnel = expenseRows.find((r) => r.category === "รายจ่ายบุคลากร")!
    .year_current;
  const operating =
    expenseRows.find((r) => r.category === "รายจ่ายดำเนินงาน - งานพื้นฐาน")!
      .year_current +
    expenseRows.find((r) => r.category === "รายจ่ายดำเนินงาน - งานบริการ")!
      .year_current +
    expenseRows.find(
      (r) => r.category === "รายจ่ายดำเนินงาน - งานโครงการขับเคลื่อน"
    )!.year_current;
  const investment =
    expenseRows.find(
      (r) => r.category === "รายจ่ายลงทุน - ที่ดินและสิ่งก่อสร้าง"
    )!.year_current +
    expenseRows.find((r) => r.category === "รายจ่ายลงทุน - ครุภัณฑ์")!
      .year_current +
    expenseRows.find((r) => r.category === "รายจ่ายลงทุน - อื่นๆ")!
      .year_current;

  const expense = [
    { category: "รายจ่ายบุคลากร", amount: personnel },
    {
      category:
        "รายจ่ายการดำเนินงาน (งานพื้นฐาน+งานบริการ+โครงการขับเคลื่อน)",
      amount: operating,
    },
    { category: "รายจ่ายลงทุน (ที่ดินสิ่งก่อสร้าง+ครุภัณฑ์+อื่นๆ)", amount: investment },
  ];
  const expense_total = personnel + operating + investment;

  const carryover = db
    .prepare(
      `SELECT id, item_name, committed_amount, note FROM carryover_items WHERE organization_name = ? ORDER BY created_at ASC`
    )
    .all(org) as DashboardData["carryover"];
  const carryover_total = carryover.reduce((s, c) => s + c.committed_amount, 0);

  return {
    organization_name: org,
    fiscal_year: fiscalYear,
    revenue,
    revenue_total,
    expense,
    expense_total,
    carryover,
    carryover_total,
  };
}

export function getAllOrganizations(db: Database.Database): string[] {
  const tables = [
    "revenue_current_year_items",
    "expense_personnel_items",
    "expense_basic_items",
    "expense_service_items",
    "expense_project_items",
    "expense_investment_items",
    "carryover_items",
  ];
  const names = new Set<string>();
  for (const t of tables) {
    const rows = db
      .prepare(`SELECT DISTINCT organization_name FROM ${t}`)
      .all() as { organization_name: string }[];
    rows.forEach((r) => names.add(r.organization_name));
  }
  return Array.from(names).sort();
}

export function getMasterDashboard(db: Database.Database, fiscalYear: number) {
  const orgs = getAllOrganizations(db);
  const perOrg = orgs.map((org) => getDashboard(db, org, fiscalYear));
  const totalRevenue = perOrg.reduce((s, o) => s + o.revenue_total, 0);
  const totalExpense = perOrg.reduce((s, o) => s + o.expense_total, 0);
  return { organizations: orgs, perOrg, totalRevenue, totalExpense };
}
