"use server"
import { API_URL } from "@/app/lib/api/getSoils"
import { safetySchema, TsafetySchema } from "@/app/schemas/safetySchema"
import { roundToTwoDecimals } from "@/app/lib/equations"

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
    const response = await fetch(`${API_URL}/factors/${safetyFactors.id}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(updatedSafetyFactors)
    })

    if (!response.ok) {
      return { message: "Failed to update safety factors. Please try again.", errors: {}}
    }
    return { message: "Safety factors updated successfully" }

  } catch {
    return { message: "Failed to update safety factors. Please try again later.", errors: {}}
  }
}