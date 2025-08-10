import type { Metadata } from "next";
import "./globals.css";
import Header from "././components/Header";
import Footer from "././components/Footer";

export const metadata: Metadata = {
  title: "TheEVStore - Premium Tesla Parts",
  description: "Precision-engineered Tesla parts and accessories for Model 3 & Y",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}