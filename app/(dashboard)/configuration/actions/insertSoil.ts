"use server"
import { TinsertSoilSchema } from "@/schemas/soilSchemas"
import { calculateResultsForFineSoil, calculateResultsForSoils } from "@/lib/equations"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function insertSoil(soil: TinsertSoilSchema, profileId: string): Promise<ReturnType> {

  if (soil.soil_name) {
    soil = {...soil, soil_name: soil.soil_name.charAt(0).toUpperCase() + soil.soil_name.slice(1)}
  }

  if (soil.soil_type === "fine") {
    soil = { ...soil,...await calculateResultsForFineSoil(soil, profileId)}
  }

  else {
    soil = { ...soil,...await calculateResultsForSoils(soil, profileId)}
  }

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()

    const fullSoil = {
      ...soil,
      user_id: data?.claims.sub,
      soil_profile_id: profileId
    }

    const { error } = await supabase
    .from('soils')
    .insert(fullSoil)
     
    if (error) {
      return { message: `Failed to add ${soil.soil_name ? soil.soil_name : soil.soil}, please try again later.`, errors: {}}
    }
    
    revalidatePath('/configuration')
    return { message: ` ${soil.soil_name ? soil.soil_name : soil.soil} has been successfully added` }
  }
  
  catch {
    return { message: `Failed to add ${soil.soil_name ? soil.soil_name : soil.soil}, please try again later.`, errors: {}}
  }
}
