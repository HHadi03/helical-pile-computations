import { createClient } from "@/utils/supabase/server"
import { TpileSchema } from "@/schemas/pileSchema"
import { snakeToCamel } from "./caseConversion"

export async function getPile(id: string): Promise<TpileSchema | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('piles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      return null
    }
    
    const pile = snakeToCamel(data)
    return pile as TpileSchema
    
  } catch {
    return null
  }
}