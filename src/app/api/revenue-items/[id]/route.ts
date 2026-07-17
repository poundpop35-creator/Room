import { makeItemRoute } from "@/lib/itemsRoute";

const cfg = {
  table: "revenue_current_year_items",
  fields: [
    "category",
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

export const { PUT, DELETE } = makeItemRoute(cfg);
