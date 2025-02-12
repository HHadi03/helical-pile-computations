import { Toaster } from "@/app/components/ui/toaster"
export default function SoilLayout({
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