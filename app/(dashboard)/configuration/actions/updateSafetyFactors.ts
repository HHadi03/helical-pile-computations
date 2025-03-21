"use server"
import { safetySchema, TsafetySchema } from "@/app/schemas/safetySchema"
import { roundToTwoDecimals } from "@/app/lib/equations"
import { supabase } from "@/app/lib/supabaseClient"
import { camelToSnake } from "@/app/lib/caseConversion"

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

  // Server Validation
  const combination1 = safetyFactors.permanentActions * safetyFactors.gammaG1 + safetyFactors.variableActions * safetyFactors.gammaQ1
  const combination2 = safetyFactors.permanentActions * safetyFactors.gammaG2 + safetyFactors.variableActions * safetyFactors.gammaQ2
  
  const updatedSafetyFactors = {
    ...safetyFactors,
    combination1: roundToTwoDecimals(combination1),
    combination2: roundToTwoDecimals(combination2)
  }
  // End Of Server Validation

  try {
    const snakeCaseSafetyFactors = camelToSnake(updatedSafetyFactors)
    const { error } = await supabase
      .from('factors')
      .update(snakeCaseSafetyFactors)
      .eq('id', safetyFactors.id)

    if (error) {
      return { message: "Failed to update safety factors. Please try again.", errors: {}}
    }
    return { message: "Safety factors updated successfully" }

  } catch (error) {
    return { message: "Failed to update safety factors. Please try again later.", errors: {}}
  }
}