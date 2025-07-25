"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function deleteAll(): Promise<ReturnType> {

  try {
    const supabase = await createClient()
    const { error } = await supabase
    .from("soil_profiles")
    .delete()
    .not('id', 'is', null)

    if (error) {
      return { message: `Failed to delete all soil profiles, please try again later.`, errors: {}}
    }

    revalidatePath('/configuration')
    return { message: `All soil profiles have been successfully deleted`}
  }
  
  catch {
    return { message: `Failed to delete all soil profiles, please try again later.`, errors: {}}
  }
}