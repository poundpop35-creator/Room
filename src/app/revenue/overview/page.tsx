"use client";

import { OverviewTable } from "@/components/OverviewTable";
import { PageHeader } from "@/components/PageHeader";

export default function RevenueOverviewPage() {
  return (
    <div>
      <PageHeader
        title="1. ภาพรวมรายรับ"
        subtitle="ไม่ต้องกรอกยอดปีปัจจุบัน (ดึงจากชีท 1.1 ให้อัตโนมัติ) กรอกแค่ประมาณการ 3 ปีข้างหน้า"
      />
      <OverviewTable apiPath="/api/revenue-overview" totalLabel="รวมรายรับ" />
    </div>
  );
}
