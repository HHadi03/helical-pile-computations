"use server"
import { TsoilProfileSchema, soilProfileSchema } from "@/schemas/soilProfileSchema"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function updateProfile(profile: TsoilProfileSchema): Promise<ReturnType> {
  const parsed = soilProfileSchema.safeParse(profile)

  if (!parsed.success) {
    return {
      message: "Please check the highlighted fields and try again.",
      errors: parsed.error.flatten().fieldErrors
    }
  }

  try {
    const snakeCaseProfile = camelToSnake(profile)
    const supabase = await createClient()
    const { error } = await supabase
      .from("soil_profiles")
      .update(snakeCaseProfile)
      .eq("id", profile.id)

    if (error) {
      return {
        message: "Failed to update profile, please try again later.",
        errors: {}
      }
    }

    revalidatePath("/configuration")
    return {
      message: "Profile has been successfully updated"
    }
  } catch {
    return {
      message: "Failed to update profile, please try again later.",
      errors: {}
    }
  }
}
