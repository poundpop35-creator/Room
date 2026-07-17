import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { OrgProvider } from "@/components/OrgContext";
import { AppShell } from "@/components/AppShell";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "แผนเงินบำรุง | M-SIIS",
  description: "ระบบกรอกแผนรายรับ-รายจ่ายเงินบำรุงประจำปี",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <OrgProvider>
          <AppShell>{children}</AppShell>
        </OrgProvider>
      </body>
    </html>
  );
}
