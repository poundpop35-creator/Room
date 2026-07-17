"use client";

import Link from "next/link";
import { useOrg } from "@/components/OrgContext";
import { ORGANIZATIONS } from "@/lib/constants";

const SECTIONS = [
  {
    title: "1. รายรับ",
    items: [
      { href: "/revenue/current", label: "1.1 รายรับปีปัจจุบัน", desc: "กรอกแผนรายรับรายไตรมาส" },
      { href: "/revenue/overview", label: "1. ภาพรวมรายรับ", desc: "ยอดปีปัจจุบัน + ประมาณการ 3 ปี" },
    ],
  },
  {
    title: "2. รายจ่าย",
    items: [
      { href: "/expense/personnel", label: "2.1 รายจ่ายบุคลากร", desc: "ค่าจ้าง ค่าตอบแทนบุคลากร" },
      { href: "/expense/basic", label: "2.2 รายจ่ายพื้นฐาน", desc: "วัสดุ/ค่าใช้จ่ายดำเนินงานพื้นฐาน" },
      { href: "/expense/service", label: "2.3 รายจ่ายบริการ", desc: "งานบริการมุ่งเน้น/ตามภารกิจ" },
      { href: "/expense/project", label: "2.4 รายจ่ายขับเคลื่อน", desc: "รายจ่ายตามโครงการ" },
      { href: "/expense/investment", label: "2.5 รายจ่ายลงทุน", desc: "ครุภัณฑ์/ที่ดินสิ่งก่อสร้าง/อื่นๆ" },
      { href: "/expense/overview", label: "2. ภาพรวมรายจ่าย", desc: "ยอดปีปัจจุบัน + ประมาณการ 3 ปี" },
    ],
  },
  {
    title: "สรุปผล",
    items: [
      { href: "/dashboard", label: "0. สรุปแผนเงินบำรุง", desc: "Dashboard สรุปผลของหน่วยงานนี้" },
      { href: "/master-dashboard", label: "ภาพรวมทุกหน่วยงาน", desc: "รวมข้อมูลทุกหน่วยงาน (ส่วนกลาง)" },
    ],
  },
];

export default function Home() {
  const { organization, setOrganization, ready } = useOrg();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-800">
          ระบบแผนเงินบำรุง
        </h1>
        <p className="mt-1 text-slate-500">
          กรอกแผนรายรับ-รายจ่ายเงินบำรุงประจำปี แล้วให้ระบบคำนวณหน้าสรุปให้อัตโนมัติ
        </p>

        {ready && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="text-sm text-slate-600">หน่วยงาน/กลุ่มงานของคุณ:</label>
            <select
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-80 max-w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="" disabled>
                เลือกหน่วยงาน...
              </option>
              {ORGANIZATIONS.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>
        )}
        {ready && !organization && (
          <p className="mt-2 text-sm text-amber-600">
            ⚠ เลือกหน่วยงานก่อนเริ่มกรอกข้อมูล (ระบบจะจำไว้ให้อัตโนมัติในเครื่องนี้)
          </p>
        )}
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {section.title}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-400 hover:shadow-md"
              >
                <p className="font-medium text-slate-800">{item.label}</p>
                <p className="mt-0.5 text-sm text-slate-500">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
