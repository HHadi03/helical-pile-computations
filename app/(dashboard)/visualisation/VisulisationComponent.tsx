"use client"

import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

export function VisulisationComponent() {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const existing = localStorage.getItem("myKey")
    if (!existing) {
      
    }
    setOpen(false)
  }, [])

  const handleContinue = () => {
    localStorage.setItem("myKey", "acknowledged")
    setOpen(false)
  }


  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome!</AlertDialogTitle>
          <AlertDialogDescription>
            This message only shows the first time you visit.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>Dismiss</AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue}>Got it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
