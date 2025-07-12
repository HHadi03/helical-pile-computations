"use server"
import { TsoilSchema } from "@/schemas/soilSchema"
import { calculateResultsForFineSoil, calculateResultsForSoils } from "@/lib/equations"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function insertSoil(soil: TsoilSchema, profileId: string): Promise<ReturnType> {

  if (soil.soilName) {
    soil = {...soil, soilName: soil.soilName.charAt(0).toUpperCase() + soil.soilName.slice(1)}
  }

  if (soil.soilType === "fine") {
    soil = { ...soil,...await calculateResultsForFineSoil(soil, profileId)}
  }

  else {
    soil = { ...soil,...await calculateResultsForSoils(soil, profileId)}
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const snakeCaseSoil = camelToSnake({
      ...soil,
      user_id: user!.id,
      soil_profile_id: profileId
    })

    const { error } = await supabase
    .from('soils')
    .insert(snakeCaseSoil)
     
    if (error) {
      return { message: "Failed to insert soil layer, please try again later.", errors: {}}
    }
    
    revalidatePath('/configuration')
    return { message: "Soil layer has been successfully inserted" }
  }
  
  catch {
    return { message: "Failed to insert soil layer, please try again later.", errors: {}}
  }
}
