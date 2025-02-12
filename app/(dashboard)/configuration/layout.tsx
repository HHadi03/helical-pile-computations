import { Toaster } from "@/app/components/ui/toaster"
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
        <Toaster/>
        </>
    )
}