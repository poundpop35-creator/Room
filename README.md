# ระบบแผนเงินบำรุง (M-SIIS)

เว็บแอปสำหรับกรอกแผนรายรับ-รายจ่ายเงินบำรุงประจำปี พร้อมหน้าจอสรุปผลอัตโนมัติ
สร้างขึ้นตามสเปกในไฟล์ Excel ต้นแบบ (README / สเปก 0-5 / Data Dictionary / กฎการคำนวณ / Dropdown / ผังหน้าจอ)

## สแตก

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- SQLite ผ่าน `better-sqlite3` (ไฟล์ฐานข้อมูลอยู่ที่ `data/budget.db`, ไม่ถูก commit)

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## โครงสร้างหน้าจอ

| หน้าจอ | เส้นทาง | ตารางข้อมูล |
| --- | --- | --- |
| 1.1 รายรับปีปัจจุบัน | `/revenue/current` | `revenue_current_year_items` |
| 1. ภาพรวมรายรับ | `/revenue/overview` | `revenue_yearly_overview` |
| 2.1 รายจ่ายบุคลากร | `/expense/personnel` | `expense_personnel_items` |
| 2.2 รายจ่ายพื้นฐาน | `/expense/basic` | `expense_basic_items` |
| 2.3 รายจ่ายบริการ | `/expense/service` | `expense_service_items` |
| 2.4 รายจ่ายขับเคลื่อน | `/expense/project` | `expense_project_items` |
| 2.5 รายจ่ายลงทุน | `/expense/investment` | `expense_investment_items` |
| 2. ภาพรวมรายจ่าย | `/expense/overview` | `expense_yearly_overview` |
| 0. สรุปแผนเงินบำรุง | `/dashboard` | อ่านจากทุกตารางข้างต้น + `carryover_items` |
| ภาพรวมทุกหน่วยงาน | `/master-dashboard` | รวมทุกหน่วยงาน (GROUP BY organization_name) |

ยอด "ปีปัจจุบัน" ในหน้าภาพรวม/สรุปผลทั้งหมดคำนวณจากรายการย่อยฝั่ง backend เสมอ
(ดู `src/lib/aggregation.ts`) ผู้ใช้ไม่สามารถกรอกทับได้ ตรงตามกฎใน สเปก 2. กฎการคำนวณ ของไฟล์ต้นแบบ

หน่วยงานปัจจุบันถูกเก็บไว้ในเบราว์เซอร์ (localStorage) และแนบไปกับทุกคำขอ/แถวข้อมูล
ส่วน "ภาพรวมทุกหน่วยงาน" ดึงข้อมูลของทุกหน่วยงานที่เคยกรอกเข้าฐานข้อมูลเดียวกัน
