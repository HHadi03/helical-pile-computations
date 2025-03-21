"use server"
import { pileSchema, TpileSchema } from "@/app/schemas/pileSchema"
import { getSoils } from "@/app/api/getSoils"
import { getPile } from "@/app/api/getPile"
import { supabase } from "@/app/lib/supabaseClient"
import { camelToSnake } from "@/app/lib/caseConversion"
import { revalidatePath } from "next/cache"

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

  // Server Validation
  const existingPile = await getPile()
  if (!existingPile) {
    return { message: "Failed to fetch pile data. Please try again.", errors: {}}
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

    const lastSoilLayer = existingSoils[existingSoils.length - 1]
    if (parsed.data.pileLength > lastSoilLayer.endDepth) {
      return {
        message: "Pile toe depth is deeper than the bottom of soil layers.",
        errors: { pileLength: [`Pile length must not exceed ${lastSoilLayer.endDepth}m`] }
      }
    }
  }
  // End of Server Validation

  try {
    const snakeCasePile = camelToSnake(pile)
    const { error } = await supabase
      .from('pile')
      .update(snakeCasePile)
      .eq('id', pile.id)

    if (error) {
      return { message: "Failed to update pile data. Please try again.", errors: {}}
    }
    revalidatePath('/configuration')
    return { message: "Pile data updated successfully" }

  } catch (error) {
    return { message: "Failed to update pile data. Please try again later.", errors: {}}
  }
}