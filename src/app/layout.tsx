import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UCLA Fire Map",
  description: "Real-time fire monitoring and alerts for the UCLA community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
