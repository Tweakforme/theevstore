import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TheEVStore - Tesla Parts Admin",
  description: "Admin dashboard for Tesla Model 3 & Y parts store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}