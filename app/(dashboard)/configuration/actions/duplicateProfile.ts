"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function duplicateProfile(profileId: string) {
  try {
    const supabase = await createClient()
    const { data: profileData, error: profilFetchError } = await supabase
    .from("soil_profiles")
    .select("profile_name, water_depth, pile_length, pile_stick_out, effective_pile_length, user_id")
    .eq("id", profileId)
    .single()
    
    if (profilFetchError) {
      return { message: "Failed to fetch relevant soil profile, please try again later.", errors: {}}
    }

    const { data: soilData, error: soilFetchError } = await supabase
    .from('soils')
    .select("user_id, soil_type, density, soil, soil_name, description, colour, start_depth, end_depth, test_type, n_value, y_moist, y_sat, qc, qca, kc, a, po, angle, t, su, qult, shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100")
    .eq("soil_profile_id", profileId)
    
    if (soilFetchError) {
      return { message: "Failed to fetch relevant soil layers, please try again later.", errors: {}}
    }

    if (profileData.profile_name) {
      profileData.profile_name = `${profileData.profile_name} ✦`
    }

    const {data: profileAdd, error: profileAddError} = await supabase
    .from("soil_profiles")
    .insert(profileData)
    .select("id")
    .single()
    
    if (profileAddError) {
      return {message: `Failed to add  ${profileData.profile_name ? profileData.profile_name : `soil profile`}, please try again later.`, errors:{}}
    }
    
    const updatedSoilData = soilData.map(soil => ({...soil, soil_profile_id: profileAdd.id}))
    const {error: soilAddError} = await supabase
    .from("soils")
    .insert(updatedSoilData)

    if (soilAddError) {
      return { message: `Failed to add some soil layers, please try again later.`, errors: {}}
    }

    revalidatePath('/configuration')
    return { message: `${profileData.profile_name ? profileData.profile_name : `Soil Profile`} has been succesfully duplicated` }
  } 
  
  catch {
    return { message: "Failed to duplicate soil profile, please try again later.", errors: {}}
  }
}