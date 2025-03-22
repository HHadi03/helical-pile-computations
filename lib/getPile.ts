import { supabase } from "@/lib/supabaseClient"
import { TpileSchema } from "@/schemas/pileSchema"
import { snakeToCamel } from "../lib/caseConversion"

export async function getPile(): Promise<TpileSchema | null> {
  try {
    const { data, error } = await supabase
      .from('pile')
      .select('*')
      .eq('id', '1')
      .single()
    
    if (error) {
      console.error('Error fetching pile:', error)
      return null
    }
    
    const pile = snakeToCamel(data)
    return pile as TpileSchema
    
  } catch (error) {
    console.error('Error processing pile data:', error)
    return null
  }
}