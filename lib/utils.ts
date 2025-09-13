import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLuminance (color: string) {
  const hex = color.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function randomColorPicker() {
  let hexColor: string

  do {
    const randomColor = Math.floor(Math.random() * 16777216)
    hexColor = randomColor.toString(16).padStart(6, "0")
  } while (hexColor === "000000" || hexColor === "ffffff")

  return `#${hexColor}`
}

export function roundToTwoDecimals (value: number): number {
  return Math.round(value * 100) / 100
}


