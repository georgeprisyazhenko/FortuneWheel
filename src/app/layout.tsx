import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wheel for Teams",
  description: "Внутренний сервис выбора ведущего",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

