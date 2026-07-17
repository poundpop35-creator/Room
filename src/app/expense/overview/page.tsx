"use client";

import { OverviewTable } from "@/components/OverviewTable";
import { PageHeader } from "@/components/PageHeader";

export default function ExpenseOverviewPage() {
  return (
    <div>
      <PageHeader
        title="2. ภาพรวมรายจ่าย"
        subtitle="ไม่ต้องกรอกยอดปีปัจจุบัน (ดึงจากชีท 2.1-2.5 ให้อัตโนมัติ) กรอกแค่ประมาณการ 3 ปีข้างหน้า"
      />
      <OverviewTable apiPath="/api/expense-overview" totalLabel="รวมรายจ่าย" />
    </div>
  );
}
