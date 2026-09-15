import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOMO | التعلم بالذكاء الاصطناعي",
  description:
    "منصة تعلم تكيفية تعمل بالذكاء الاصطناعي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
    >
      <body>{children}</body>
    </html>
  );
} 