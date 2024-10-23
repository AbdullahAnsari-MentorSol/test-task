import { fontSans } from "@/lib/fonts"

import { cn } from "@kreios/ui"

import "./globals.css"

import { VercelToolbar } from "@vercel/toolbar/next"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-muted/40 font-sans text-foreground antialiased", fontSans.variable)}>
        {/* eslint-disable-next-line no-restricted-properties */}
        {process.env.NODE_ENV === "development" && <VercelToolbar />}
        {children}
      </body>
    </html>
  )
}
