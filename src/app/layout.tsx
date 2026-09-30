import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMotion from "@/components/PageMotion";
import ToastProvider from "@/components/ToastProvider";
import ThemeProvider from "@/components/ThemeProvider";
import { getSiteSettings } from "@/lib/settings";
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
  title: `${settings.companyName} | Construction & Architectural Design`,
  description:
    "Professional construction, architectural design and interactive 3D visualization services.",
  };
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><ToastProvider><ThemeProvider>
        <Navbar />
        <main><PageMotion>{children}</PageMotion></main>
        <Footer />
      </ThemeProvider></ToastProvider></body>
    </html>
  );
}
