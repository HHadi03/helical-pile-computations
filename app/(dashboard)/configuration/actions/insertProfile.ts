"use server"
import { camelToSnake } from "@/lib/caseConversion"
import { TsoilProfileSchema } from "@/schemas/soilProfileSchema"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}
  
export async function insertProfile(profile: TsoilProfileSchema): Promise<ReturnType> {
  
  if (profile.profileName) {
    profile = {...profile, profileName: profile. profileName.charAt(0).toUpperCase() + profile. profileName.slice(1)}
  }
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const snakeCaseProfile = camelToSnake ({
      ...profile,
      user_id: user!.id
    })
    
    const { error } = await supabase
    .from('soil_profiles')
    .insert(snakeCaseProfile)

    if (error) {
      return {message: `Failed to add  ${profile.profileName ? profile.profileName: `Soil Profile`}, please try again later.`, errors:{}}
    }

    revalidatePath('/configuration')
    return { message: `${profile.profileName ? profile.profileName: `Soil Profile`} has been successfully added` }
  }
  
  catch {
    return { message: `Failed to add ${profile.profileName ? profile.profileName: `Soil Profile`}, please try again later.`, errors: {}}
  }
}
