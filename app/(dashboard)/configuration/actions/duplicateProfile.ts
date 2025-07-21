"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { camelToSnake } from "@/lib/caseConversion"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function duplicateProfile(profileId: string): Promise<ReturnType> {

  try {
    const supabase = await createClient()

    //fetch profiledata
    const { data: profileData, error: profilFetchError } = await supabase
    .from("soil_profiles")
    .select("profile_name, water_depth, pile_length, pile_stick_out, user_id")
    .eq("id", profileId)
    .single()
    
    //fetch soildata
    const { data: soilData, error: soilFetchError } = await supabase
    .from('soils')
    .select("soil_type, density, soil, soil_name, description, colour, start_depth, end_depth, n_value, y_moist, y_sat, po, angle, ko, t, su, h, user_id, shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100, qult")
    .eq("soil_profile_id", profileId)
    
    if (soilFetchError || profilFetchError) {
      return { message: "Failed to fetch relevant soil layers/soil profile please try again later.", errors: {}}
    }
    
    //insert the profiledata
    const snakeCaseProfile = camelToSnake(profileData)
    const {data: profileAdd, error: profileAddError} = await supabase
    .from("soil_profiles")
    .insert(snakeCaseProfile)
    .select("id")
    .single()
    
    if (profileAddError) {
      return {message: `Failed to add  ${profileData.profile_name ? profileData.profile_name : `soil profile`}, please try again later.`, errors:{}}
    }
    
    //insert the soildata
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