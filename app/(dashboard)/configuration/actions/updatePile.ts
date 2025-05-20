"use server"
import { pileSchema, TpileSchema } from "@/schemas/pileSchema"
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

  try {
    const snakeCasePile = camelToSnake(pile)
    const supabase = await createClient()
    const { error } = await supabase
    .from('piles')
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