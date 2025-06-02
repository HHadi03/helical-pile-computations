import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Helical Pile Computations",
  description: "A tool for calculating tensile and compression capacities on helical pile foundations",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
  
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
