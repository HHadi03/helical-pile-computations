"use server"
import { soilSchema, TsoilSchema } from "@/schemas/soilSchema"
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
  
  if (soil.soilType === "fine") {
    soil = { ...soil,
    ...await calculateResultsForFineSoil(soil)}
  }

  else {
    soil = { ...soil,
    ...await calculateResultsForSoils(soil)}
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const snakeCaseSoil = camelToSnake({
      ...soil,
      user_id: user!.id
    })

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