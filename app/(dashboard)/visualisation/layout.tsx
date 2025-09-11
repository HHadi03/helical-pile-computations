import { Toaster } from "@/components/ui/sonner"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Visualisation | Helical Pile Computations",
  description: "Visualise a selection of your soil profiles computed results.",
}

export default function VisualisationLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors duration={3000} visibleToasts={1}/>
    </>
  )
}