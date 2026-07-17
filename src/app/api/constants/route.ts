import { NextResponse } from "next/server";
import {
  REVENUE_CATEGORIES,
  PERSONNEL_SUBCATEGORIES,
  BASIC_SUBCATEGORIES,
  SERVICE_SUBCATEGORIES,
  INVESTMENT_SUBCATEGORIES,
  EQUIPMENT_TYPES,
  EXPENSE_OVERVIEW_CATEGORIES,
} from "@/lib/constants";

export async function GET() {
  return NextResponse.json({
    revenueCategories: REVENUE_CATEGORIES,
    personnelSubcategories: PERSONNEL_SUBCATEGORIES,
    basicSubcategories: BASIC_SUBCATEGORIES,
    serviceSubcategories: SERVICE_SUBCATEGORIES,
    investmentSubcategories: INVESTMENT_SUBCATEGORIES,
    equipmentTypes: EQUIPMENT_TYPES,
    expenseOverviewCategories: EXPENSE_OVERVIEW_CATEGORIES,
  });
}
