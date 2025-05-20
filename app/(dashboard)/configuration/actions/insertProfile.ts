"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}
  
export async function insertProfile(): Promise<ReturnType> {
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
   
    const { error } = await supabase
    .from('soil_profiles')
    .insert([{user_id: user!.id}])
    .select('id')

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
