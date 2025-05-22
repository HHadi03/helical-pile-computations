"use server"
import { soilSchema, TsoilSchema } from "@/schemas/soilSchema"
import { calculateResultsForFineSoil, calculateResultsForSoils } from "@/lib/equations"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"
import { revalidatePath } from "next/cache"
import { getProfile } from "@/lib/getProfile"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function insertSoil(soil: TsoilSchema, profileId: string): Promise<ReturnType> {

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
    const profileData = await getProfile(profileId)
    const waterDepth = profileData!.waterDepth
    soil = { ...soil,
    ...await calculateResultsForSoils(soil, waterDepth)}
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
