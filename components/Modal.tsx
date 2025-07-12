"use client"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { useRouter } from "next/navigation"
import { useRef } from "react"

export const Modal = ({ children, title}: {children: React.ReactNode, title: string}) => {
  const router = useRouter()
  const titleRef = useRef<HTMLHeadingElement>(null)

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={router.back}>
        <DialogContent onInteractOutside={(e) => {e.preventDefault()}} onOpenAutoFocus={(e) => {e.preventDefault(); titleRef.current?.focus()}}>
          <DialogHeader>
            <DialogTitle tabIndex={-1} ref={titleRef} className="flex justify-center items-center outline-none">{title}</DialogTitle>
            <VisuallyHidden.Root><DialogDescription>A Modal with a form to request user input</DialogDescription></VisuallyHidden.Root>
          </DialogHeader>
          {children}
        </DialogContent>
    </Dialog>
  )
}

