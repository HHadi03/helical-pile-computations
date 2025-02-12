"use server"
import { pileSchema, TpileSchema } from "@/app/lib/schemas/pileSchema"
import { API_URL } from "@/app/lib/api/getSoils"
import { getSoils } from "@/app/lib/api/getSoils"
import { getPile } from "@/app/lib/api/getPile" 

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function updatePile(pile: TpileSchema): Promise<ReturnType> {
  const parsed = pileSchema.safeParse(pile)
  if (!parsed.success) {
    return {
      message: "Please check the highlighted fields and try again.",
      errors: parsed.error.flatten().fieldErrors
    }
  }

  const existingPile = await getPile()
  if (!existingPile) {
    return { message: "Failed to update pile data. Please try again.", errors: {}}
  }

  const isPileLengthModified = parsed.data.pileLength !== existingPile.pileLength

  if (isPileLengthModified) {
    const existingSoils = await getSoils()
    if (existingSoils.length === 0) {
      return {
        message: "Please add soil entries first before editing pile length.",
        errors: { pileLength: ["Soil data is required before setting pile length"] }
      }
    }

    const sortedSoils = existingSoils.sort((a, b) => a.startDepth - b.startDepth)
    const lastSoilLayer = sortedSoils[sortedSoils.length - 1]
    if (parsed.data.pileLength > lastSoilLayer.endDepth) {
      return {
        message: "Pile toe depth is deeper than the bottom of soil layers.",
        errors: { pileLength: [`Pile length must not exceed ${lastSoilLayer.endDepth}m`] }
      }
    }
  }

  try {
    const response = await fetch(`${API_URL}/pile/${pile.id}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(pile)
    })

    if (!response.ok) {
      return {message: "Failed to update pile data. Please try again.", errors: {}}
    }
    return { message: "Pile data updated successfully" }

  } catch {
    return {message: "Failed to update pile data. Please try again later.", errors: {}}
  }
}