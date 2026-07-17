import { makeItemRoute } from "@/lib/itemsRoute";

const cfg = {
  table: "expense_service_items",
  fields: [
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
};

export const { PUT, DELETE } = makeItemRoute(cfg);
