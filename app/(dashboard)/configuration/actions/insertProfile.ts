"use server"
import { TinsertSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { capitaliseFirstLetter } from "@/lib/utils"

export async function insertProfile(profile: TinsertSoilProfileSchema) {
 
  if (profile.profile_name) {
    profile = {...profile, profile_name: capitaliseFirstLetter(profile.profile_name)}
  }

  const effectivePileLength = profile.pile_length - profile.pile_stick_out
  const roundedEffectivePileLength = parseFloat(effectivePileLength.toFixed(1))

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()

    const fullProfile = {
      ...profile,
      user_id: data?.claims.sub,
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
