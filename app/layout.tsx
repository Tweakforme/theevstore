// app/layout.tsx
import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Providers from "./components/SessionProvider";

// Configure Space Mono font
const spaceMono = Space_Mono({ 
  subsets: ["latin"],
  weight: ["400", "700"], // Space Mono only comes in 400 and 700
  style: ["normal", "italic"], // Include both normal and italic
  display: "swap",
});

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
      <body className={`${spaceMono.className} min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50`}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}