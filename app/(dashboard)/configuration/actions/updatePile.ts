"use server"
import { pileSchema, TpileSchema } from "@/schemas/pileSchema"
import { getSoils } from "@/lib/getSoils"
import { getPile } from "@/lib/getPile"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"

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

  const pileData = await getPile()
  if (!pileData) {
    return { message: "Failed to fetch pile data. Please try again.", errors: {}}
  }

  const isPileLengthModified = parsed.data.pileLength !== pileData.pileLength
  if (isPileLengthModified) {
    const soilsData = await getSoils()
    if (soilsData.length === 0) {
      return {
        message: "Please add soil entries first before editing pile length.",
        errors: { pileLength: ["Soil data is required before setting pile length"] }
      }
    }

    const lastSoilLayer = soilsData[soilsData.length - 1]
    if (parsed.data.pileLength > lastSoilLayer.endDepth) {
      return {
        message: "Pile toe depth is deeper than the bottom of soil layers.",
        errors: { pileLength: [`Pile length must not exceed ${lastSoilLayer.endDepth}m`] }
      }
    }
  }

  try {
    const snakeCasePile = camelToSnake(pile)
    const supabase = await createClient()
    const { error } = await supabase
    .from('pile')
    .update(snakeCasePile)
    .eq('id', pile.id)

    if (error) {
      return { message: "Failed to update pile data. Please try again.", errors: {}}
    }
    return { message: "Pile data updated successfully" }

  } catch {
    return { message: "Failed to update pile data. Please try again later.", errors: {}}
  }
}