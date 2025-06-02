"use server"
import { camelToSnake } from "@/lib/caseConversion"
import { soilProfileSchema, TsoilProfileSchema } from "@/schemas/soilProfileSchema"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}
  
export async function insertProfile(profile: TsoilProfileSchema): Promise<ReturnType> {
  
  const parsed = soilProfileSchema.safeParse(profile)
  if (!parsed.success) {
    return {
      message: "Please check the highlighted fields and try again.",
      errors: parsed.error.flatten().fieldErrors
    }
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
      return {message: "Failed to insert soil profile, please try again later.", errors:{}}
    }

    revalidatePath('/configuration')
    return { message: "Soil profile has been successfully inserted" }
  }
  
  catch {
    return { message: "Failed to insert soil profile, please try again later.", errors: {}}
  }
}
