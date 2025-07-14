"use client"
import { Toggle } from "@/components/ui/toggle"
import { useState } from "react"
import { RectangleVertical } from "lucide-react"

export function ToggleButton ({children}: {children: React.ReactNode}) {
  const [is60Active, setIs60Active] = useState(false)
  return (
    <div>
      <Toggle aria-label="Toggle 60mm pile" pressed={is60Active} onPressedChange={setIs60Active}>
        <RectangleVertical/> {is60Active === false ? "Toggle 60mm Pile" : "Toggle 100mm Pile"}
      </Toggle>
      {children}
    </div>
  )
}