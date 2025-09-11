"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteAll() {
  try {
    const supabase = await createClient()
    const { error } = await supabase
    .from("soil_profiles")
    .delete()
    .not('id', 'is', null)

    if (error) {
      return { message: `Failed to delete soil profiles, please try again later.`, errors: {}}
    }

    revalidatePath('/configuration')
    return { message: `Soil Profiles have been successfully deleted`}
  }
  
  catch {
    return { message: `Failed to delete soil profiles, please try again later.`, errors: {}}
  }
}