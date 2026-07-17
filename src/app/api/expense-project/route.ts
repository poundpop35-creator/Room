import { makeCollectionRoute } from "@/lib/itemsRoute";

const cfg = {
  table: "expense_project_items",
  fields: [
    "project_name",
    "item_name",
    "q1_plan",
    "q2_plan",
    "q3_plan",
    "q4_plan",
    "reason",
    "expected_output",
    "responsible",
    "note",
  ],
  numericFields: ["q1_plan", "q2_plan", "q3_plan", "q4_plan"],
  hasQuarters: true,
  hasCode: true,
};

export const { GET, POST } = makeCollectionRoute(cfg);
