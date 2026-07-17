"use client";

import { ItemsTable, ColumnSpec } from "@/components/ItemsTable";
import { PageHeader } from "@/components/PageHeader";

const columns: ColumnSpec[] = [
  { key: "project_name", label: "ชื่อโครงการ", type: "text" },
  { key: "item_name", label: "รายการ", type: "text" },
  { key: "q1_plan", label: "ไตรมาส 1", type: "number" },
  { key: "q2_plan", label: "ไตรมาส 2", type: "number" },
  { key: "q3_plan", label: "ไตรมาส 3", type: "number" },
  { key: "q4_plan", label: "ไตรมาส 4", type: "number" },
  { key: "reason", label: "เหตุผลความจำเป็น", type: "textarea" },
  { key: "expected_output", label: "ผลผลิตที่จะได้รับ", type: "textarea" },
  { key: "responsible", label: "ผู้รับผิดชอบ", type: "text" },
  { key: "note", label: "หมายเหตุ", type: "textarea" },
];

export default function ExpenseProjectPage() {
  return (
    <div>
      <PageHeader
        title="2.4 รายจ่ายขับเคลื่อน"
        subtitle="กรอกแผนรายจ่ายตามโครงการขับเคลื่อน — ตั้งชื่อโครงการได้อิสระ ไม่มี dropdown บังคับ"
      />
      <ItemsTable
        apiPath="/api/expense-project"
        columns={columns}
        hasQuarters
        addButtonLabel="+ เพิ่มรายการ/โครงการ"
      />
    </div>
  );
}
