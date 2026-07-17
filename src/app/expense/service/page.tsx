"use client";

import { ItemsTable, ColumnSpec } from "@/components/ItemsTable";
import { PageHeader } from "@/components/PageHeader";
import { SERVICE_SUBCATEGORIES } from "@/lib/constants";

const columns: ColumnSpec[] = [
  { key: "subcategory", label: "หมวดย่อย", type: "select", options: SERVICE_SUBCATEGORIES },
  { key: "item_name", label: "รายการ", type: "text" },
  { key: "q1_plan", label: "ไตรมาส 1", type: "number" },
  { key: "q2_plan", label: "ไตรมาส 2", type: "number" },
  { key: "q3_plan", label: "ไตรมาส 3", type: "number" },
  { key: "q4_plan", label: "ไตรมาส 4", type: "number" },
  { key: "responsible", label: "ผู้รับผิดชอบ", type: "text" },
  { key: "note", label: "หมายเหตุ", type: "textarea" },
];

export default function ExpenseServicePage() {
  return (
    <div>
      <PageHeader
        title="2.3 รายจ่ายบริการ"
        subtitle="กรอกแผนรายจ่ายงานบริการรายไตรมาส แยกตามหมวดย่อย"
      />
      <ItemsTable
        apiPath="/api/expense-service"
        columns={columns}
        hasQuarters
        groupBy="subcategory"
      />
    </div>
  );
}
