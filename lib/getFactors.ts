import { createClient } from "@/utils/supabase/server"
import { TsafetySchema } from "@/schemas/safetySchema"

export async function getFactors(): Promise<TsafetySchema | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('factors')
      .select('*')
      .single()
    
    if (error) {
      return null
    }
    
    return data
  } catch {
    return null
  }
}