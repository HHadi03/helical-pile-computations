import { Toaster } from "@/app/components/ui/toaster"
import { FormEditProvider } from "./FormContext"

export default function ConfigurationLayout({
    children,
    modal,
}: {
    children: React.ReactNode
    modal: React.ReactNode
}) {
    return (
        <>
        <FormEditProvider>
        {children}
        {modal}
        <Toaster/>
        </FormEditProvider>
        </>
    )
}