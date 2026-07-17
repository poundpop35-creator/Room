"use client";

import { ItemsTable, ColumnSpec } from "@/components/ItemsTable";
import { PageHeader } from "@/components/PageHeader";
import { BASIC_SUBCATEGORIES } from "@/lib/constants";

const columns: ColumnSpec[] = [
  { key: "subcategory", label: "หมวดย่อย", type: "select", options: BASIC_SUBCATEGORIES },
  { key: "item_name", label: "รายการ", type: "text" },
  { key: "q1_plan", label: "ไตรมาส 1", type: "number" },
  { key: "q2_plan", label: "ไตรมาส 2", type: "number" },
  { key: "q3_plan", label: "ไตรมาส 3", type: "number" },
  { key: "q4_plan", label: "ไตรมาส 4", type: "number" },
  { key: "responsible", label: "ผู้รับผิดชอบ", type: "text" },
  { key: "note", label: "หมายเหตุ", type: "textarea" },
];

export default function ExpenseBasicPage() {
  return (
    <div>
      <PageHeader
        title="2.2 รายจ่ายพื้นฐาน"
        subtitle="กรอกแผนรายจ่ายดำเนินงานพื้นฐานรายไตรมาส แยกตามหมวดย่อย (วัสดุ 18 ประเภท + อื่นๆ 6 หมวด)"
      />
      <ItemsTable
        apiPath="/api/expense-basic"
        columns={columns}
        hasQuarters
        groupBy="subcategory"
        showCode
      />
    </div>
  );
}
