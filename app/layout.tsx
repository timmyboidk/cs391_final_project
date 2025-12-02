import type { Metadata } from "next";
import "./globals.css";

//updated layout.tsx with metadata for project

export const metadata: Metadata = {
  title: 'CA Lottery Scratcher EV Calculator',
  description: 'Calculate expected value for California Lottery Scratcher games',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}