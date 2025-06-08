import { Toaster } from "@/components/ui/sonner"
import { FormContextProvider } from "./FormContext"

export default function ConfigurationLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <FormContextProvider>
      {children}
      {modal}
      <Toaster position="top-right" richColors duration={3000}/>
    </FormContextProvider>
  )
}