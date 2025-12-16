"use server"
import { TinsertSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { calculateResultsForFineSoilNoFetch, calculateResultsForSoilsNoFetch, calculateResultsForSoilsCPTNoFetch, calculateResultsForFineSoilCPTNoFetch } from "@/lib/equations"
import { capitaliseFirstLetter } from "@/lib/utils"

type DirtyFields = Partial<Record<keyof TinsertSoilProfileSchema, boolean>>

export async function updateProfile(profile: TinsertSoilProfileSchema, profileId: string, dirtyFields: DirtyFields = {}) {
  
  if (profile.profile_name && dirtyFields.profile_name) {
    profile = {...profile, profile_name: capitaliseFirstLetter(profile.profile_name)}
  }

  const effectivePileLength = profile.pile_length - profile.pile_stick_out
  const roundedEffectivePileLength = parseFloat(effectivePileLength.toFixed(1))
  
  if (dirtyFields.water_depth || dirtyFields.pile_length || dirtyFields.pile_stick_out) {
    const supabase = await createClient()
    const { data, error } = await supabase
    .from("soils")
    .select("id, start_depth, end_depth, y_moist, y_sat, n_value, soil_type, test_type, qca, qc, kc, a")
    .eq("soil_profile_id", profileId)
      
    if (error) {
      return { message: `Failed to edit ${profile.profile_name ? profile.profile_name: `soil profile`}, please try again later.`, errors: {} }
    }

    const pileParametersChanged = dirtyFields.pile_length || dirtyFields.pile_stick_out
    const soilCalculations = await Promise.all(data.map(async (soil) => {
      try {
        let result
        
        if (dirtyFields.water_depth && !pileParametersChanged && soil.soil_type === "fine" && soil.test_type === "spt") {
          return true 
        }
        
        if (soil.test_type === "spt") {
          if (soil.soil_type === "fine") {
            result = await calculateResultsForFineSoilNoFetch(soil, roundedEffectivePileLength)
          } 
          
          else {
            result = await calculateResultsForSoilsNoFetch(soil, roundedEffectivePileLength, profile.water_depth)
          }
        } 
        
        else {
          if (soil.soil_type === "fine") {
            result = await calculateResultsForFineSoilCPTNoFetch(soil, roundedEffectivePileLength)
          } 
          
          else {
            result = await calculateResultsForSoilsCPTNoFetch(soil, roundedEffectivePileLength)
          }
        }

        const { error } = await supabase
        .from("soils")
        .update(result)
        .eq("id", soil.id)

        return !error
      } 
      
      catch {
        return false
      }
    }))

    const allSuccessful = soilCalculations.every((success) => success)
    if (!allSuccessful) {
      return { message: `Failed to edit ${profile.profile_name ? profile.profile_name: `soil profile`}, some soil layers failed to calculate.`, errors: {} }
    }
  }

  try {
    const fullProfile = {...profile, effective_pile_length: roundedEffectivePileLength}
    const supabase = await createClient()
    const { error } = await supabase
    .from("soil_profiles")
    .update(fullProfile)
    .eq("id", profileId)

    if (error) {
      return { message: `Failed to edit ${profile.profile_name ? profile.profile_name: `soil profile`}, please try again later.`, errors: {}}
    }

    revalidatePath("/configuration")
    return {message: `${profile.profile_name ? profile.profile_name: `Soil Profile`} has been successfully edited`}
  }

  catch {
   return { message: `Failed to edit ${profile.profile_name ? profile.profile_name: `soil profile`}, please try again later.`, errors: {}}
  }
}