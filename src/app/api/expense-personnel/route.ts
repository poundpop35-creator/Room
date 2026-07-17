import { makeCollectionRoute } from "@/lib/itemsRoute";

const cfg = {
  table: "expense_personnel_items",
  fields: [
    "employee_name",
    "subcategory",
    "item_name",
    "q1_plan",
    "q2_plan",
    "q3_plan",
    "q4_plan",
    "responsible",
    "note",
  ],
  numericFields: ["q1_plan", "q2_plan", "q3_plan", "q4_plan"],
  hasQuarters: true,
  hasCode: true,
};

export const { GET, POST } = makeCollectionRoute(cfg);
