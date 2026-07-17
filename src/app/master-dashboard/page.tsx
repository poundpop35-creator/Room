"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { formatBaht } from "@/lib/format";

interface OrgDashboard {
  organization_name: string;
  revenue_total: number;
  expense_total: number;
}

interface MasterData {
  organizations: string[];
  perOrg: OrgDashboard[];
  totalRevenue: number;
  totalExpense: number;
}

export default function MasterDashboardPage() {
  const [data, setData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/master-dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="ภาพรวมทุกหน่วยงาน (Master Dashboard)"
        subtitle="รวมข้อมูลจากทุกหน่วยงานในฐานข้อมูลกลาง — สำหรับผู้ใช้ระดับส่วนกลาง"
      />

      {loading && <p className="text-slate-500">กำลังโหลด...</p>}

      {!loading && data && data.organizations.length === 0 && (
        <p className="rounded-md border border-slate-300 bg-white p-4 text-slate-500">
          ยังไม่มีข้อมูลจากหน่วยงานใด
        </p>
      )}

      {!loading && data && data.organizations.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="จำนวนหน่วยงาน" value={String(data.organizations.length)} />
            <StatCard
              label="รวมรายรับทุกหน่วยงาน"
              value={`${formatBaht(data.totalRevenue)} บาท`}
              accent="text-emerald-700"
            />
            <StatCard
              label="รวมรายจ่ายทุกหน่วยงาน"
              value={`${formatBaht(data.totalExpense)} บาท`}
              accent="text-rose-700"
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-500">
                  <th className="border-b border-slate-200 px-3 py-2 font-medium">หน่วยงาน</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">
                    รวมรายรับ
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">
                    รวมรายจ่าย
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2 text-right font-medium">
                    ผลต่าง
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.perOrg.map((o) => (
                  <tr key={o.organization_name} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-700">
                      {o.organization_name}
                    </td>
                    <td className="px-3 py-2 text-right">{formatBaht(o.revenue_total)}</td>
                    <td className="px-3 py-2 text-right">{formatBaht(o.expense_total)}</td>
                    <td
                      className={`px-3 py-2 text-right font-medium ${
                        o.revenue_total - o.expense_total >= 0
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {formatBaht(o.revenue_total - o.expense_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-semibold text-slate-700">
                  <td className="px-3 py-2">รวมทุกหน่วยงาน</td>
                  <td className="px-3 py-2 text-right">{formatBaht(data.totalRevenue)}</td>
                  <td className="px-3 py-2 text-right">{formatBaht(data.totalExpense)}</td>
                  <td className="px-3 py-2 text-right">
                    {formatBaht(data.totalRevenue - data.totalExpense)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent ?? "text-slate-800"}`}>{value}</p>
    </div>
  );
}
