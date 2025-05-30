import { createClient } from "@/utils/supabase/server"
import { TsoilProfileSchema } from "@/schemas/soilProfileSchema"
import { snakeToCamel } from "./caseConversion"

export async function getProfile(id: string): Promise<TsoilProfileSchema | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('soil_profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      return null
    }
    
    const profile = snakeToCamel(data)
    return profile as TsoilProfileSchema
    
  } catch {
    return null
  }
}