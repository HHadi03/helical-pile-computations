"use server"
import { safetySchema, TsafetySchema } from "@/schemas/safetySchema"
import { roundToTwoDecimals } from "@/lib/equations"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function updateSafetyFactors(safetyFactors: TsafetySchema): Promise<ReturnType> {
  const parsed = safetySchema.safeParse(safetyFactors)
  if (!parsed.success) {
    return {
      message: "Please check the highlighted fields and try again.",
      errors: parsed.error.flatten().fieldErrors
    }
  }

  const combination1 = safetyFactors.permanentActions * safetyFactors.gammaG1 + safetyFactors.variableActions * safetyFactors.gammaQ1
  const combination2 = safetyFactors.permanentActions * safetyFactors.gammaG2 + safetyFactors.variableActions * safetyFactors.gammaQ2
  
  const updatedSafetyFactors = {
    ...safetyFactors,
    combination1: roundToTwoDecimals(combination1),
    combination2: roundToTwoDecimals(combination2)
  }
 
  try {
    const snakeCaseSafetyFactors = camelToSnake(updatedSafetyFactors)
    const supabase = await createClient()
    const { error } = await supabase
    .from('factors')
    .update(snakeCaseSafetyFactors)
    .eq('id', safetyFactors.id)

    if (error) {
      return { message: "Failed to update safety factors. Please try again.", errors: {}}
    }
    return { message: "Safety factors updated successfully" }

  } catch {
    return { message: "Failed to update safety factors. Please try again later.", errors: {}}
  }
}