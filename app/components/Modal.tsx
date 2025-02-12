"use client"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogTitle } from "./ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { useRouter } from "next/navigation"

interface ModalProps {
    children: React.ReactNode
    title: string
}

export const Modal = ({ children, title}: ModalProps) => {
    const router = useRouter()

    const handleOpenChange = () => {
        router.back()
    }

    return (
        <Dialog defaultOpen={true} open={true} onOpenChange={handleOpenChange}>
            <DialogOverlay className="backdrop-blur-sm bg-white/30">
                <DialogContent onInteractOutside={(e) => {e.preventDefault()}} onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex justify-center">{title}</DialogTitle>
                        <VisuallyHidden.Root><DialogDescription> A Modal that provides user interactivity </DialogDescription></VisuallyHidden.Root>
                    </DialogHeader>
                    <div className="p-5 border border-gray-700 rounded-lg shadow-lg">
                        {children}
                    </div>
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}

