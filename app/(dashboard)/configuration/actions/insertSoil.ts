"use server"
import { TinsertSoilSchema } from "@/schemas/soilSchemas"
import { calculateResultsForFineSoil, calculateResultsForSoils, calculateResultsForFineSoilCPT, calculateResultsForSoilsCPT } from "@/lib/equations"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { capitaliseFirstLetter } from "@/lib/utils"

export async function insertSoil(soil: TinsertSoilSchema, profileId: string) {

  if (soil.soil_name) {
    soil = {...soil, soil_name: capitaliseFirstLetter(soil.soil_name)}
  }
  
  if (soil.test_type === "spt") {
    if (soil.soil_type === "fine") {
    soil = { ...soil,...await calculateResultsForFineSoil(soil, profileId)}
    }

    else {
      soil = { ...soil,...await calculateResultsForSoils(soil, profileId)}
    }
  }

  else {
    if (soil.soil_type === "fine") {
      const calculatedResults = await calculateResultsForFineSoilCPT(soil, profileId)

      if (calculatedResults.su < 1) {
        return { 
          message: `Cone tip resistance value is too low, leading to negative results.`, 
          errors: { qc: [`Cone tip resistance value is too low`] }
        }
      }

      soil = { ...soil, ...calculatedResults }
    }

    else {
     soil = { ...soil,...await calculateResultsForSoilsCPT(soil, profileId)}
    }
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
