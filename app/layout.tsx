/*
 * Global Layout: Root Layout
 * ----------------------------------------------------------------------------
 * Responsible: whole team
 *
 * Description:
 * This is the root layout component that wraps every page in the application.
 * It defines the global HTML structure, applies global CSS styles, and sets
 * metadata for SEO purposes.
 *
 * Logic & Reasoning:
 * - We import "globals.css" here to ensure Tailwind utility classes are available
 * throughout the entire application.
 * - The `suppressHydrationWarning` prop is used on the body tag to prevent
 * mismatches that can occur with certain browser extensions or hydration quirks,
 * ensuring a cleaner console output during development.
 * ----------------------------------------------------------------------------
 */

import type { Metadata } from "next";
import "./globals.css";

//updated layout.tsx with metadata for project

export const metadata: Metadata = {
  title: 'MA Lottery Scratcher EV Calculator',
  description: 'Calculate expected value for MA Lottery Scratcher games',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-green-800">{children}</body>
    </html>
  )
}