import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "업킨지앤 컴퍼니 | AI 시장조사 시뮬레이터",
  description:
    "한국인 페르소나 기반 AI 시장조사 시뮬레이터. 30분 만에 한국인 100명에게 물어본 듯한 반응을 받아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
