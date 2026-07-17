"use client";

import { useEffect, useState } from "react";
import { useOrg } from "./OrgContext";
import { formatBaht } from "@/lib/format";

export interface ColumnSpec {
  key: string;
  label: string;
  type: "select" | "text" | "number" | "readonly" | "textarea";
  options?: readonly string[];
  width?: string;
  showIf?: (row: Row) => boolean;
}

export type Row = Record<string, string | number | null> & { id: string };
export type RowPatch = Record<string, string | number | null>;

interface ItemsTableProps {
  apiPath: string;
  columns: ColumnSpec[];
  hasQuarters?: boolean;
  groupBy?: string; // column key to group rows into sections with subtotals
  addButtonLabel?: string;
  defaults?: Partial<Row>;
}

function quartersTotal(row: Row) {
  return (
    Number(row.q1_plan || 0) +
    Number(row.q2_plan || 0) +
    Number(row.q3_plan || 0) +
    Number(row.q4_plan || 0)
  );
}

export function ItemsTable({
  apiPath,
  columns,
  hasQuarters,
  groupBy,
  addButtonLabel = "+ เพิ่มรายการ",
  defaults = {},
}: ItemsTableProps) {
  const { organization } = useOrg();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Render bails out to an "enter an organization" message before `rows`
    // or `loading` are ever read when `organization` is empty, so there is
    // nothing to reset here.
    if (!organization) return;
    setLoading(true);
    fetch(`${apiPath}?organization=${encodeURIComponent(organization)}`)
      .then((r) => r.json())
      .then((d) => setRows(d))
      .finally(() => setLoading(false));
  }, [apiPath, organization]);

  async function addRow(groupValue?: string) {
    const body: Record<string, unknown> = {
      organization_name: organization,
      ...defaults,
    };
    if (groupBy && groupValue) body[groupBy] = groupValue;
    for (const c of columns) {
      if (!(c.key in body)) {
        body[c.key] = c.type === "number" ? 0 : "";
      }
    }
    const res = await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;
    const created = await res.json();
    setRows((prev) => [...prev, created]);
  }

  // Updates local state immediately (so totals/UI feel instant); the network
  // save is triggered separately on blur (see `saveRow`) to avoid firing a
  // request on every keystroke.
  function setLocalRow(id: string, patch: RowPatch) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function saveRow(row: Row) {
    fetch(`${apiPath}/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
  }

  async function deleteRow(row: Row) {
    if (!confirm(`ลบรายการ "${row.item_name ?? row.id}" ?`)) return;
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    await fetch(`${apiPath}/${row.id}`, { method: "DELETE" });
  }

  if (!organization) {
    return (
      <p className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-700">
        กรุณาพิมพ์ชื่อหน่วยงานที่แถบด้านบนก่อน จึงจะกรอกข้อมูลได้
      </p>
    );
  }
  if (loading) return <p className="text-slate-500">กำลังโหลด...</p>;

  const visibleColumns = columns;
  const groups = groupBy ? columns.find((c) => c.key === groupBy)?.options ?? [] : [null];

  const grandTotal = hasQuarters
    ? rows.reduce((s, r) => s + quartersTotal(r), 0)
    : rows.reduce((s, r) => s + Number(r.committed_amount || r.amount || 0), 0);

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const groupRows = groupBy
          ? rows.filter((r) => r[groupBy] === group)
          : rows;
        const subtotal = hasQuarters
          ? groupRows.reduce((s, r) => s + quartersTotal(r), 0)
          : groupRows.reduce((s, r) => s + Number(r.committed_amount || 0), 0);

        return (
          <div key={group ?? "all"} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {groupBy && (
              <div className="flex items-center justify-between bg-slate-100 px-4 py-2">
                <h3 className="text-sm font-semibold text-slate-700">{group}</h3>
                <button
                  onClick={() => addRow(group ?? undefined)}
                  className="rounded-md bg-sky-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-700"
                >
                  {addButtonLabel}
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-max border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs text-slate-500">
                    {visibleColumns.map((c) => (
                      <th key={c.key} className="border-b border-slate-200 px-2 py-2 font-medium">
                        {c.label}
                      </th>
                    ))}
                    {hasQuarters && (
                      <th className="border-b border-slate-200 px-2 py-2 font-medium">
                        รวมทั้งปี
                      </th>
                    )}
                    <th className="border-b border-slate-200 px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {groupRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={visibleColumns.length + (hasQuarters ? 2 : 1)}
                        className="px-2 py-3 text-center text-slate-400"
                      >
                        ยังไม่มีรายการ
                      </td>
                    </tr>
                  )}
                  {groupRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                      {visibleColumns.map((c) => (
                        <td key={c.key} className={`px-2 py-1.5 ${c.width ?? ""}`}>
                          {c.showIf && !c.showIf(row) ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            <Cell
                              col={c}
                              row={row}
                              onLocalChange={(patch) => setLocalRow(row.id, patch)}
                              onCommit={(patch) => saveRow({ ...row, ...patch })}
                            />
                          )}
                        </td>
                      ))}
                      {hasQuarters && (
                        <td className="px-2 py-1.5 text-right font-medium text-slate-700">
                          {formatBaht(quartersTotal(row))}
                        </td>
                      )}
                      <td className="px-2 py-1.5 text-right">
                        <button
                          onClick={() => deleteRow(row)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {groupRows.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 font-semibold text-slate-700">
                      <td
                        colSpan={visibleColumns.length}
                        className="px-2 py-2 text-right"
                      >
                        รวม{groupBy ? `: ${group}` : ""}
                      </td>
                      {hasQuarters && <td className="px-2 py-2 text-right">{formatBaht(subtotal)}</td>}
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {!groupBy && (
              <div className="border-t border-slate-200 px-4 py-2">
                <button
                  onClick={() => addRow()}
                  className="rounded-md bg-sky-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-700"
                >
                  {addButtonLabel}
                </button>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-end rounded-lg border border-slate-300 bg-slate-100 px-4 py-3">
        <span className="text-sm font-semibold text-slate-700">
          รวมทั้งหมด: {formatBaht(grandTotal)} บาท
        </span>
      </div>
    </div>
  );
}

function Cell({
  col,
  row,
  onLocalChange,
  onCommit,
}: {
  col: ColumnSpec;
  row: Row;
  onLocalChange: (patch: RowPatch) => void;
  onCommit: (patch: RowPatch) => void;
}) {
  const value = row[col.key];

  if (col.type === "readonly") {
    return <span className="block px-1 py-1 text-slate-500">{formatBaht(Number(value || 0))}</span>;
  }

  if (col.type === "select") {
    return (
      <select
        value={(value as string) ?? ""}
        onChange={(e) => {
          const patch = { [col.key]: e.target.value };
          onLocalChange(patch);
          onCommit(patch);
        }}
        className="w-full rounded-md border border-slate-200 bg-white px-1.5 py-1 text-sm focus:border-sky-500 focus:outline-none"
      >
        <option value="" disabled>
          เลือก...
        </option>
        {col.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (col.type === "number") {
    return (
      <input
        type="number"
        step="0.01"
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) =>
          onLocalChange({ [col.key]: e.target.value === "" ? 0 : Number(e.target.value) })
        }
        onBlur={(e) => onCommit({ [col.key]: e.target.value === "" ? 0 : Number(e.target.value) })}
        className="w-24 rounded-md border border-slate-200 px-1.5 py-1 text-right text-sm focus:border-sky-500 focus:outline-none"
      />
    );
  }

  if (col.type === "textarea") {
    return (
      <textarea
        value={(value as string) ?? ""}
        onChange={(e) => onLocalChange({ [col.key]: e.target.value })}
        onBlur={(e) => onCommit({ [col.key]: e.target.value })}
        rows={1}
        className="w-full min-w-[10rem] rounded-md border border-slate-200 px-1.5 py-1 text-sm focus:border-sky-500 focus:outline-none"
      />
    );
  }

  return (
    <input
      type="text"
      value={(value as string) ?? ""}
      onChange={(e) => onLocalChange({ [col.key]: e.target.value })}
      onBlur={(e) => onCommit({ [col.key]: e.target.value })}
      className="w-full min-w-[8rem] rounded-md border border-slate-200 px-1.5 py-1 text-sm focus:border-sky-500 focus:outline-none"
    />
  );
}
