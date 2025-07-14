"use server"
import { TsoilProfileSchema } from "@/schemas/soilProfileSchema"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function updateProfile(profile: TsoilProfileSchema): Promise<ReturnType> {
  
  if (profile.profileName) {
    profile = {...profile, profileName: profile. profileName.charAt(0).toUpperCase() + profile. profileName.slice(1)}
  }

  try {
    const snakeCaseProfile = camelToSnake(profile)
    const supabase = await createClient()
    const { error } = await supabase
    .from("soil_profiles")
    .update(snakeCaseProfile)
    .eq("id", profile.id)

    if (error) {
      return { message: `Failed to edit ${profile.profileName ? profile.profileName: `Soil Profile`}, please try again later.`, errors: {}}
    }

    revalidatePath("/configuration")
    return {message: `${profile.profileName ? profile.profileName: `Soil Profile`} has been successfully edited`}
  }

  catch {
   return { message: `Failed to edit ${profile.profileName ? profile.profileName: `Soil Profile`}, please try again later.`, errors: {}}
  }
}
