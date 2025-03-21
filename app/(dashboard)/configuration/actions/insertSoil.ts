"use server"
import { soilSchema, TsoilSchema } from "@/app/schemas/soilSchema"
import { getSoils } from "@/app/api/getSoils" 
import { calculateResultsForFineSoil, calculateResultsForSoils } from "@/app/lib/equations"
import { supabase } from "@/app/lib/supabaseClient"
import { camelToSnake } from "@/app/lib/caseConversion"
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
    const { error } = await supabase
      .from('soils')
      .insert(snakeCaseSoil)
     
    if (error) {
      return { message: "Failed to submit soil data. Please try again.", errors: {}}
    }
    revalidatePath('/configuration')
    return { message: "Soil data submitted successfully 🎉" }

  } catch (error) {
    return { message: "Failed to submit soil data. Please try again later.", errors: {}}
  }
}