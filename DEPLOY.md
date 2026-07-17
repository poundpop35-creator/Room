# Deploy ขึ้น GitHub Pages + Google Sheets (สำหรับดูตัวอย่าง/ทดลอง)

โหมดนี้ไม่ต้องมีเซิร์ฟเวอร์ของตัวเอง: หน้าเว็บเป็นไฟล์ static host บน GitHub Pages
ส่วนข้อมูลเก็บใน Google Sheet ผ่าน Google Apps Script (ทำหน้าที่เป็น "backend" แทน)

## ขั้นตอนที่ 1: ตั้งค่า Google Sheet + Apps Script

1. สร้าง Google Sheet ใหม่ (sheets.new) ตั้งชื่อว่าอะไรก็ได้ เช่น "แผนเงินบำรุง-ข้อมูล"
2. เมนู **Extensions → Apps Script**
3. ลบโค้ดเดิมในไฟล์ `Code.gs` ทั้งหมด แล้ววางโค้ดทั้งไฟล์จาก `google-apps-script/Code.gs` ในโปรเจกต์นี้แทน
4. บันทึก (Ctrl+S / Cmd+S)
5. เลือกฟังก์ชัน `setupSheets` จาก dropdown ด้านบน (ข้าง Run) แล้วกด **Run**
   - ครั้งแรกจะขึ้นขอ authorize สิทธิ์ — กด "Review permissions" → เลือกบัญชี Google → "Advanced" → "Go to ... (unsafe)" → Allow (เป็นสคริปต์ของเราเอง ปลอดภัย)
   - รันเสร็จจะมี popup แจ้งว่าตั้งค่าเรียบร้อย และจะเห็นแท็บชีทใหม่ๆ ถูกสร้างขึ้นในสเปรดชีต (RevenueCurrentYearItems, ExpensePersonnelItems, ฯลฯ)
6. เมนู **Deploy → New deployment**
   - Select type (ไอคอนเฟือง) → **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - กด **Deploy**
7. คัดลอก **Web app URL** ที่ได้ (จะขึ้นต้นด้วย `https://script.google.com/macros/s/.../exec`) — เก็บไว้ใช้ในขั้นตอนถัดไป

## ขั้นตอนที่ 2: ตั้งค่า GitHub repo

1. ไปที่ repo → **Settings → Secrets and variables → Actions → tab "Variables"**
2. กด **New repository variable**
   - Name: `NEXT_PUBLIC_API_BASE_URL`
   - Value: URL ที่คัดลอกจากขั้นตอนที่ 1 (ลงท้ายด้วย `/exec`)
   - Save
3. ไปที่ **Settings → Pages**
   - Source: เลือก **GitHub Actions** (แบบที่เห็นในสกรีนช็อตที่ส่งมา)

## ขั้นตอนที่ 3: Merge เข้า main แล้วปล่อยให้ deploy อัตโนมัติ

Workflow `.github/workflows/deploy-pages.yml` ถูกตั้งให้ build + deploy อัตโนมัติทุกครั้งที่ push เข้า `main`
เมื่อ merge branch นี้เข้า `main` แล้ว ไปที่แท็บ **Actions** ของ repo จะเห็น workflow "Deploy static build to GitHub Pages" กำลังรัน
รอสักครู่ (~1-2 นาที) เสร็จแล้วเว็บจะขึ้นที่ `https://<username>.github.io/<ชื่อ-repo>/`

## หมายเหตุ/ข้อจำกัดของโหมดนี้

- **เป็นโหมดสำหรับดูตัวอย่าง/ทดลอง** ไม่เหมาะกับการใช้งานจริงระยะยาว เพราะ:
  - Google Apps Script Web App จำกัดโควตาการเรียกใช้ต่อวัน (สำหรับบัญชีฟรีทั่วไปเพียงพอสำหรับทดลองใช้ไม่กี่คน)
  - การเขียนพร้อมกันจากหลายคนพร้อมกันมากๆ อาจช้าเพราะ Google Sheets ไม่ได้ออกแบบมาเป็นฐานข้อมูลแอปจริงจัง
  - ทุกคนที่มีลิงก์ URL ของหน้าเว็บสามารถเข้าถึง/แก้ไขข้อมูลได้ (ไม่มีระบบ login แยกสิทธิ์ต่อหน่วยงาน)
- ถ้าทดลองแล้วต้องการใช้งานจริง แนะนำย้ายกลับไปใช้ backend เดิม (Next.js + SQLite) แล้ว deploy บน Render/Railway ตามที่คุยกันไว้ก่อนหน้านี้ — โค้ดส่วนนั้นยังอยู่ครบ ไม่ได้ถูกลบทิ้ง (แค่ไม่ได้ใช้งานตอน build แบบ static)
- แก้ไขข้อมูลใน Google Sheet โดยตรงก็ได้ (เช่น ลบแถวทดสอบ) แต่ห้ามแก้หัวคอลัมน์แถวที่ 1 หรือสลับลำดับคอลัมน์ เพราะสคริปต์อ้างอิงชื่อคอลัมน์จากแถวหัวตาราง

## สลับกลับไปใช้ backend เดิม (SQLite ในเครื่อง/บนเซิร์ฟเวอร์)

ไม่ต้องแก้อะไร แค่**อย่าตั้งค่า** `NEXT_PUBLIC_API_BASE_URL` — รัน `npm run dev` หรือ `npm run build && npm run start` ตามปกติ
แอปจะใช้ API routes ในเครื่อง (`src/app/api/*`) กับฐานข้อมูล SQLite โดยอัตโนมัติเหมือนเดิม
