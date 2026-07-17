"use client";

import { ItemsTable, ColumnSpec, Row } from "@/components/ItemsTable";
import { PageHeader } from "@/components/PageHeader";
import { INVESTMENT_SUBCATEGORIES, EQUIPMENT_TYPES } from "@/lib/constants";

const columns: ColumnSpec[] = [
  { key: "subcategory", label: "หมวดย่อย", type: "select", options: INVESTMENT_SUBCATEGORIES },
  {
    key: "equipment_type",
    label: "ประเภทครุภัณฑ์",
    type: "select",
    options: EQUIPMENT_TYPES,
    showIf: (row: Row) => row.subcategory === "ครุภัณฑ์",
  },
  { key: "item_name", label: "รายการ", type: "text" },
  { key: "unit", label: "หน่วยนับ", type: "text", width: "w-20" },
  { key: "quantity", label: "จำนวน", type: "number" },
  { key: "unit_price", label: "ราคาต่อหน่วย", type: "number" },
  { key: "amount", label: "จำนวนเงิน", type: "readonly" },
  { key: "q1_plan", label: "ไตรมาส 1", type: "number" },
  { key: "q2_plan", label: "ไตรมาส 2", type: "number" },
  { key: "q3_plan", label: "ไตรมาส 3", type: "number" },
  { key: "q4_plan", label: "ไตรมาส 4", type: "number" },
  { key: "responsible", label: "ผู้รับผิดชอบ", type: "text" },
  { key: "note", label: "หมายเหตุ", type: "textarea" },
];

export default function ExpenseInvestmentPage() {
  return (
    <div>
      <PageHeader
        title="2.5 รายจ่ายลงทุน"
        subtitle="กรอกแผนรายจ่ายลงทุนรายไตรมาส แยกตามหมวดย่อย — เมื่อเลือกหมวดย่อย 'ครุภัณฑ์' จะมีช่องเลือกประเภทครุภัณฑ์เพิ่มเติม"
      />
      <ItemsTable
        apiPath="/api/expense-investment"
        columns={columns}
        hasQuarters
        groupBy="subcategory"
      />
    </div>
  );
}
