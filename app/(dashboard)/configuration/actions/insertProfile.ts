"use server"
import { TinsertSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}
  
export async function insertProfile(profile: TinsertSoilProfileSchema): Promise<ReturnType> {
 
  if (profile.profile_name) {
    profile = {...profile, profile_name: profile. profile_name.charAt(0).toUpperCase() + profile. profile_name.slice(1)}
  }

  const effectivePileLength = profile.pile_length - profile.pile_stick_out
  const roundedEffectivePileLength = parseFloat(effectivePileLength.toFixed(1))

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const fullProfile = {
      ...profile,
      user_id: user!.id,
      effective_pile_length: roundedEffectivePileLength
    }
    
    const { error } = await supabase
    .from('soil_profiles')
    .insert(fullProfile)

    if (error) {
      return {message: `Failed to add  ${profile.profile_name ? profile.profile_name: `soil profile`}, please try again later.`, errors:{}}
    }

    revalidatePath('/configuration')
    return { message: `${profile.profile_name ? profile.profile_name: `Soil Profile`} has been successfully added` }
  }
  
  catch {
    return { message: `Failed to add ${profile.profile_name ? profile.profile_name: `soil profile`}, please try again later.`, errors: {}}
  }
}
