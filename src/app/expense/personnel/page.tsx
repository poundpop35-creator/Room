"use client";

import { ItemsTable, ColumnSpec } from "@/components/ItemsTable";
import { PageHeader } from "@/components/PageHeader";
import { PERSONNEL_SUBCATEGORIES } from "@/lib/constants";

const columns: ColumnSpec[] = [
  { key: "employee_name", label: "ชื่อ-สกุล ผู้ปฏิบัติงาน", type: "text" },
  { key: "subcategory", label: "หมวดย่อย", type: "select", options: PERSONNEL_SUBCATEGORIES },
  { key: "item_name", label: "รายการ", type: "text" },
  { key: "q1_plan", label: "ไตรมาส 1", type: "number" },
  { key: "q2_plan", label: "ไตรมาส 2", type: "number" },
  { key: "q3_plan", label: "ไตรมาส 3", type: "number" },
  { key: "q4_plan", label: "ไตรมาส 4", type: "number" },
  { key: "responsible", label: "ผู้รับผิดชอบ", type: "text" },
  { key: "note", label: "หมายเหตุ", type: "textarea" },
];

export default function ExpensePersonnelPage() {
  return (
    <div>
      <PageHeader
        title="2.1 รายจ่ายบุคลากร"
        subtitle="กรอกแผนรายจ่ายบุคลากรรายไตรมาส แยกตามหมวดย่อย"
      />
      <ItemsTable
        apiPath="/api/expense-personnel"
        columns={columns}
        hasQuarters
        groupBy="subcategory"
        showCode
      />
    </div>
  );
}
