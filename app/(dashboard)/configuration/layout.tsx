import { Toaster } from "@/app/components/ui/toaster"
import { FormContextProvider } from "./FormContext"

export default function ConfigurationLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      <FormContextProvider>
        {children}
        {modal}
        <Toaster/>
      </FormContextProvider>
    </>
  )
}