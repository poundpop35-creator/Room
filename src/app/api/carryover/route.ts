import { makeCollectionRoute } from "@/lib/itemsRoute";

const cfg = {
  table: "carryover_items",
  fields: ["item_name", "committed_amount", "note"],
  numericFields: ["committed_amount"],
  hasQuarters: false,
};

export const { GET, POST } = makeCollectionRoute(cfg);
