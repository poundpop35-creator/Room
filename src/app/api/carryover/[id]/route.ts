import { makeItemRoute } from "@/lib/itemsRoute";

const cfg = {
  table: "carryover_items",
  fields: ["item_name", "committed_amount", "note"],
  numericFields: ["committed_amount"],
  hasQuarters: false,
};

export const { PUT, DELETE } = makeItemRoute(cfg);
