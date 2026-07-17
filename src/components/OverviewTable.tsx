"use client";

import { useEffect, useState } from "react";
import { useOrg } from "./OrgContext";
import { formatBaht } from "@/lib/format";
import { apiFetch } from "@/lib/apiClient";

interface OverviewRow {
  organization_name: string;
  category: string;
  year_current: number;
  forecast_year1: number;
  forecast_year2: number;
  forecast_year3: number;
  responsible: string | null;
  note: string | null;
}

export function OverviewTable({
  apiPath,
  totalLabel,
}: {
  apiPath: string;
  totalLabel: string;
}) {
  const { organization, fiscalYear } = useOrg();
  const [rows, setRows] = useState<OverviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization) return;
    setLoading(true);
    apiFetch(`${apiPath}?organization=${encodeURIComponent(organization)}`)
      .then((r) => r.json())
      .then((d) => setRows(d))
      .finally(() => setLoading(false));
  }, [apiPath, organization]);

  function setLocal(category: string, patch: Partial<OverviewRow>) {
    setRows((prev) =>
      prev.map((r) => (r.category === category ? { ...r, ...patch } : r))
    );
  }

  function save(row: OverviewRow) {
    apiFetch(apiPath, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
  }

  if (!organization) {
    return (
      <p className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-700">
        กรุณาเลือกหน่วยงานที่แถบด้านบนก่อน จึงจะดูข้อมูลได้
      </p>
    );
  }
  if (loading) return <p className="text-slate-500">กำลังโหลด...</p>;

  const totals = rows.reduce(
    (acc, r) => ({
      year_current: acc.year_current + r.year_current,
      forecast_year1: acc.forecast_year1 + r.forecast_year1,
      forecast_year2: acc.forecast_year2 + r.forecast_year2,
      forecast_year3: acc.forecast_year3 + r.forecast_year3,
    }),
    { year_current: 0, forecast_year1: 0, forecast_year2: 0, forecast_year3: 0 }
  );

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs text-slate-500">
              <th className="border-b border-slate-200 px-3 py-2 font-medium">หมวดหมู่</th>
              <th className="border-b border-slate-200 px-3 py-2 font-medium">
                ปี {fiscalYear} (ปีปัจจุบัน — สูตรอัตโนมัติ)
              </th>
              <th className="border-b border-slate-200 px-3 py-2 font-medium">ประมาณการปีที่ 1</th>
              <th className="border-b border-slate-200 px-3 py-2 font-medium">ประมาณการปีที่ 2</th>
              <th className="border-b border-slate-200 px-3 py-2 font-medium">ประมาณการปีที่ 3</th>
              <th className="border-b border-slate-200 px-3 py-2 font-medium">ผู้รับผิดชอบ</th>
              <th className="border-b border-slate-200 px-3 py-2 font-medium">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.category} className="border-b border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-700">{row.category}</td>
                <td className="px-3 py-2 text-right italic text-sky-700">
                  {formatBaht(row.year_current)}
                </td>
                {(["forecast_year1", "forecast_year2", "forecast_year3"] as const).map((k) => (
                  <td key={k} className="px-2 py-1.5">
                    <input
                      type="number"
                      step="0.01"
                      value={row[k]}
                      onChange={(e) =>
                        setLocal(row.category, { [k]: Number(e.target.value || 0) })
                      }
                      onBlur={() => save(rows.find((r) => r.category === row.category)!)}
                      className="w-28 rounded-md border border-slate-200 px-1.5 py-1 text-right text-sm focus:border-sky-500 focus:outline-none"
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={row.responsible ?? ""}
                    onChange={(e) => setLocal(row.category, { responsible: e.target.value })}
                    onBlur={() => save(rows.find((r) => r.category === row.category)!)}
                    className="w-32 rounded-md border border-slate-200 px-1.5 py-1 text-sm focus:border-sky-500 focus:outline-none"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={row.note ?? ""}
                    onChange={(e) => setLocal(row.category, { note: e.target.value })}
                    onBlur={() => save(rows.find((r) => r.category === row.category)!)}
                    className="w-40 rounded-md border border-slate-200 px-1.5 py-1 text-sm focus:border-sky-500 focus:outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-semibold text-slate-700">
              <td className="px-3 py-2">{totalLabel}</td>
              <td className="px-3 py-2 text-right">{formatBaht(totals.year_current)}</td>
              <td className="px-3 py-2 text-right">{formatBaht(totals.forecast_year1)}</td>
              <td className="px-3 py-2 text-right">{formatBaht(totals.forecast_year2)}</td>
              <td className="px-3 py-2 text-right">{formatBaht(totals.forecast_year3)}</td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
