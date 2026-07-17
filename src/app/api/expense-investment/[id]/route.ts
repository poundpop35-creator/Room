import { makeItemRoute } from "@/lib/itemsRoute";

const cfg = {
  table: "expense_investment_items",
  fields: [
    "subcategory",
    "equipment_type",
    "item_name",
    "unit",
    "quantity",
    "unit_price",
    "q1_plan",
    "q2_plan",
    "q3_plan",
    "q4_plan",
    "responsible",
    "note",
  ],
  numericFields: [
    "quantity",
    "unit_price",
    "q1_plan",
    "q2_plan",
    "q3_plan",
    "q4_plan",
  ],
  hasQuarters: true,
  computeAmount: true,
  hasCode: true,
};

export const { PUT, DELETE } = makeItemRoute(cfg);
