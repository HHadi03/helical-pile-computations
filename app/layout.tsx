import type { Metadata } from "next"
import { ThemeProvider } from "@/components/ThemeProvider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Helical Pile Computations",
  description: "A tool for calculating tensile and compression capacities on helical pile foundations.",
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
