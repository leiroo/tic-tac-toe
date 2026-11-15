import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dark Arcade Tic-Tac-Toe",
  description: "A Tic-Tac-Toe portfolio project, built one milestone at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
