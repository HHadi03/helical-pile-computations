"use server"
import { TinsertDesignMethodSchema } from "@/schemas/designMethodSchemas"
import { roundToTwoDecimals } from "@/lib/equations"
import { createClient } from "@/utils/supabase/server"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function insertDesignMethod(safetyFactors: TinsertDesignMethodSchema): Promise<ReturnType> {

  try {
    const supabase = await createClient()
    const { error } = await supabase
    .from('factors')
    .update(safetyFactors)
    .eq('id', safetyFactors.safety_design_method)

    if (error) {
      return { message: "Failed to update safety factors. Please try again.", errors: {}}
    }
    return { message: "Safety factors updated successfully" }

  } catch {
    return { message: "Failed to update safety factors. Please try again later.", errors: {}}
  }
}