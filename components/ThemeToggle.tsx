"use client"

import * as React from "react"
import { Moon, Sun, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const {theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button title="Toggle Theme" variant="outline" size="icon" className="size-8 rounded-full">
          <Sun className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"/>
          <Moon className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"/>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center justify-between">Light {theme === "light" && <Check/>}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center justify-between">Dark {theme === "dark" && <Check/>}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center justify-between">System {theme === "system" && <Check/>}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
