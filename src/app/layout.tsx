import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MortgageHelper - Canadian Mortgage Agent CRM",
  description: "Streamlined CRM for Canadian mortgage agents to manage leads, tasks, and client communications efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
