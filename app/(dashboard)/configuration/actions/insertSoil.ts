"use server"
import { soilSchema, TsoilSchema } from "@/schemas/soilSchema"
import { getSoils } from "@/lib/getSoils" 
import { calculateResultsForFineSoil, calculateResultsForSoils } from "@/lib/equations"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function insertSoil(soil: TsoilSchema): Promise<ReturnType> {
  const parsed = soilSchema.safeParse(soil)
  if (!parsed.success) {
    return {
      message: "Please check the highlighted fields and try again.",
      errors: parsed.error.flatten().fieldErrors
    }
  }
  
  // Server Validation
  const existingSoils = await getSoils()
  if (existingSoils.length === 0 && soil.startDepth > 0) {
    return {
      message: "The first soil layer must start at depth 0m.",
      errors: {startDepth: ["First soil layer must start at 0m"]}
    }
  }

  const lastSoilLayer = existingSoils[existingSoils.length - 1]
  if (lastSoilLayer && soil.startDepth !== lastSoilLayer.endDepth) {
    return {
      message: "The start depth must match the end depth of the previous soil layer.",
      errors: {startDepth: [`Start depth must be ${lastSoilLayer.endDepth}m to match the previous layer`]}
    }
  }

  if (soil.soilType === "fine") {soil = { ...soil, ...await calculateResultsForFineSoil(soil) }}
  else {soil = { ...soil, ...await calculateResultsForSoils(soil) }}
  // End of Server Validation

  try {
    const snakeCaseSoil = camelToSnake(soil)
    const supabase = await createClient()
    const { error } = await supabase
      .from('soils')
      .insert(snakeCaseSoil)
     
    if (error) {
      return { message: "Failed to submit soil data. Please try again.", errors: {}}
    }
    revalidatePath('/configuration')
    return { message: "Soil data submitted successfully 🎉" }

  } catch {
    return { message: "Failed to submit soil data. Please try again later.", errors: {}}
  }
}