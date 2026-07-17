"use client";

import { ItemsTable, ColumnSpec } from "@/components/ItemsTable";
import { PageHeader } from "@/components/PageHeader";
import { REVENUE_CATEGORIES } from "@/lib/constants";

const columns: ColumnSpec[] = [
  { key: "category", label: "หมวดหมู่", type: "select", options: REVENUE_CATEGORIES },
  { key: "item_name", label: "รายการ", type: "text" },
  { key: "q1_plan", label: "ไตรมาส 1", type: "number" },
  { key: "q2_plan", label: "ไตรมาส 2", type: "number" },
  { key: "q3_plan", label: "ไตรมาส 3", type: "number" },
  { key: "q4_plan", label: "ไตรมาส 4", type: "number" },
  { key: "responsible", label: "ผู้รับผิดชอบ", type: "text" },
  { key: "note", label: "หมายเหตุ", type: "textarea" },
];

export default function RevenueCurrentPage() {
  return (
    <div>
      <PageHeader
        title="1.1 รายรับปีปัจจุบัน"
        subtitle="กรอกแผนรายรับรายไตรมาส แยกตามหมวดหมู่ — ยอดจากหน้านี้จะรวมไปที่หน้า '1. ภาพรวมรายรับ' โดยอัตโนมัติ"
      />
      <ItemsTable apiPath="/api/revenue-items" columns={columns} hasQuarters groupBy="category" showCode />
    </div>
  );
}
