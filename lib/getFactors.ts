import { createClient } from "@/utils/supabase/server"
import { TsafetySchema } from "@/schemas/safetySchema"
import { snakeToCamel } from "./caseConversion"

export async function getFactors(): Promise<TsafetySchema | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('factors')
      .select('*')
      .eq('id', '1')
      .single()
    
    if (error) {
      console.error('Error fetching factors:', error)
      return null
    }
    
    const factors = snakeToCamel(data)
    return factors as TsafetySchema
    
  } catch (error) {
    console.error('Error processing factors data:', error)
    return null
  }
}