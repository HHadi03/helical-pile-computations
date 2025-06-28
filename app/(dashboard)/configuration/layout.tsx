import { Toaster } from "@/components/ui/sonner"

export default function ConfigurationLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {children}
      {modal}
      <Toaster position="top-right" richColors duration={3000} visibleToasts={1}/>
    </>
  )
}