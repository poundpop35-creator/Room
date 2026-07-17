"use client";

import { useEffect, useState } from "react";
import { useOrg } from "@/components/OrgContext";
import { PageHeader } from "@/components/PageHeader";
import { ItemsTable, ColumnSpec } from "@/components/ItemsTable";
import { formatBaht } from "@/lib/format";

interface DashboardData {
  organization_name: string;
  fiscal_year: number;
  revenue: { category: string; amount: number }[];
  revenue_total: number;
  expense: { category: string; amount: number }[];
  expense_total: number;
}

const carryoverColumns: ColumnSpec[] = [
  { key: "item_name", label: "รายการ", type: "text" },
  { key: "committed_amount", label: "วงเงิน", type: "number" },
  { key: "note", label: "หมายเหตุ", type: "textarea" },
];

export default function DashboardPage() {
  const { organization, fiscalYear } = useOrg();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization) return;
    setLoading(true);
    fetch(`/api/dashboard?organization=${encodeURIComponent(organization)}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [organization, fiscalYear]);

  return (
    <div>
      <PageHeader
        title="0. สรุปแผนเงินบำรุง"
        subtitle={`หน้าจอสรุปผลอัตโนมัติ (read-only) — คำนวณจากข้อมูลที่กรอกในหน้า 1.1 / 1. / 2.1-2.5 / 2. ทั้งหมด`}
      />

      {!organization && (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-700">
          กรุณาพิมพ์ชื่อหน่วยงานที่แถบด้านบนก่อน จึงจะดูข้อมูลได้
        </p>
      )}

      {organization && loading && <p className="text-slate-500">กำลังโหลด...</p>}

      {organization && data && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SummaryCard
              title="รายการ (รายรับ)"
              yearLabel={`ปีปัจจุบัน (${fiscalYear})`}
              rows={data.revenue.map((r, i) => ({
                label: `${i + 1}. ${r.category}`,
                amount: r.amount,
              }))}
              totalLabel="รวมรายรับ"
              total={data.revenue_total}
              accent="text-emerald-700"
            />
            <SummaryCard
              title="รายการ (รายจ่าย)"
              yearLabel={`ปีปัจจุบัน (${fiscalYear})`}
              rows={data.expense.map((r, i) => ({
                label: `${i + 1}. ${r.category}`,
                amount: r.amount,
              }))}
              totalLabel="รวมรายจ่าย"
              total={data.expense_total}
              accent="text-rose-700"
            />
          </div>

          <div className="mt-4 rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">
              ผลต่างรายรับ - รายจ่าย ปีปัจจุบัน:{" "}
              <span
                className={`font-semibold ${
                  data.revenue_total - data.expense_total >= 0
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {formatBaht(data.revenue_total - data.expense_total)} บาท
              </span>
            </p>
          </div>

          <div className="mt-8">
            <h2 className="mb-2 text-base font-semibold text-slate-700">
              รายการที่ได้รับอนุมัติในปีงบประมาณก่อนหน้า แต่ดำเนินการหรือเบิกจ่ายไม่ทัน
            </h2>
            <ItemsTable
              apiPath="/api/carryover"
              columns={carryoverColumns}
              addButtonLabel="+ เพิ่มรายการ"
            />
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  yearLabel,
  rows,
  totalLabel,
  total,
  accent,
}: {
  title: string;
  yearLabel: string;
  rows: { label: string; amount: number }[];
  totalLabel: string;
  total: number;
  accent: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs text-slate-500">
            <th className="border-b border-slate-200 px-3 py-2 font-medium">{title}</th>
            <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">
              {yearLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-slate-100">
              <td className="px-3 py-2 text-slate-700">{r.label}</td>
              <td className="px-3 py-2 text-right">{formatBaht(r.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-semibold">
            <td className="px-3 py-2">{totalLabel}</td>
            <td className={`px-3 py-2 text-right ${accent}`}>{formatBaht(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
