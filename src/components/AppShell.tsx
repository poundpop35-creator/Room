"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useOrg } from "./OrgContext";

const NAV_GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "รายรับ",
    links: [
      { href: "/revenue/current", label: "1.1 รายรับปีปัจจุบัน" },
      { href: "/revenue/overview", label: "1. ภาพรวมรายรับ" },
    ],
  },
  {
    title: "รายจ่าย",
    links: [
      { href: "/expense/personnel", label: "2.1 รายจ่ายบุคลากร" },
      { href: "/expense/basic", label: "2.2 รายจ่ายพื้นฐาน" },
      { href: "/expense/service", label: "2.3 รายจ่ายบริการ" },
      { href: "/expense/project", label: "2.4 รายจ่ายขับเคลื่อน" },
      { href: "/expense/investment", label: "2.5 รายจ่ายลงทุน" },
      { href: "/expense/overview", label: "2. ภาพรวมรายจ่าย" },
    ],
  },
  {
    title: "สรุปผล",
    links: [
      { href: "/dashboard", label: "0. สรุปแผนเงินบำรุง" },
      { href: "/master-dashboard", label: "ภาพรวมทุกหน่วยงาน" },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { organization, setOrganization, fiscalYear, setFiscalYear, ready } = useOrg();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside
        className={`shrink-0 border-b border-slate-200 bg-slate-900 text-slate-100 md:w-64 md:border-b-0 md:border-r ${
          navOpen ? "" : "max-md:hidden"
        }`}
      >
        <div className="p-4">
          <Link href="/" className="block text-base font-semibold leading-tight">
            แผนเงินบำรุง
          </Link>
          <p className="mt-0.5 text-xs text-slate-400">M-SIIS ต้นแบบระบบ</p>
        </div>
        <nav className="space-y-4 px-2 pb-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {group.title}
              </p>
              <ul className="mt-1 space-y-0.5">
                {group.links.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setNavOpen(false)}
                        className={`block rounded-md px-2 py-1.5 text-sm ${
                          active
                            ? "bg-sky-600 text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button
            className="rounded-md border border-slate-300 px-2 py-1 text-sm md:hidden"
            onClick={() => setNavOpen((v) => !v)}
          >
            เมนู
          </button>

          <div className="flex items-center gap-1.5">
            <label className="text-sm text-slate-500">หน่วยงาน:</label>
            <input
              key={organization}
              defaultValue={organization}
              onBlur={(e) => setOrganization(e.target.value.trim())}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              placeholder="พิมพ์ชื่อหน่วยงาน/กลุ่มงาน"
              className="w-56 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-sm text-slate-500">ปีงบประมาณปัจจุบัน:</label>
            <input
              key={fiscalYear}
              defaultValue={fiscalYear}
              onBlur={(e) => {
                const y = Number(e.target.value);
                if (Number.isFinite(y) && y >= 2500 && y <= 2700) setFiscalYear(y);
                else e.target.value = String(fiscalYear);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>

          {ready && !organization && (
            <span className="text-sm text-amber-600">
              ⚠ กรุณาพิมพ์ชื่อหน่วยงานก่อนเริ่มกรอกข้อมูล
            </span>
          )}
        </header>

        <main className="min-w-0 flex-1 bg-slate-50 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
