import { Toaster } from "@/components/ui/sonner"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configuration | Helical Pile Computations",
  description: "Set up soil profiles and piles for analysis.",
}

export default function ConfigurationLayout({children, modal}: {children: React.ReactNode, modal: React.ReactNode}) {
  return (
    <>
      {children}
      {modal}
      <Toaster position="top-right" richColors duration={3000} visibleToasts={1}/>
    </>
  )
}