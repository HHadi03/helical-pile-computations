"use client"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogTitle } from "./ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { useRouter } from "next/navigation"
import { useRef } from "react"

export const Modal = ({ children, title}: {children: React.ReactNode, title: string}) => {
  const router = useRouter()
  const titleRef = useRef<HTMLHeadingElement>(null)

  const handleOpenChange = () => {
    router.back()
  }

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={handleOpenChange}>
      <DialogOverlay className="backdrop-blur-xs bg-black/50">
        <DialogContent onInteractOutside={(e) => {e.preventDefault()}} onOpenAutoFocus={(e) => {e.preventDefault(); titleRef.current?.focus()}}>
          <DialogHeader>
            <DialogTitle tabIndex={-1} ref={titleRef} className="flex justify-center items-center outline-none">{title}</DialogTitle>
            <VisuallyHidden.Root><DialogDescription> A Modal that provides user interactivity </DialogDescription></VisuallyHidden.Root>
          </DialogHeader>
          <div className="p-5 border border-gray-400 rounded-lg shadow-lg">{children}</div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  )
}

