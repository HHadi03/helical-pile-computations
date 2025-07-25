import {TsoilSchema } from "@/schemas/soilSchemas"
import { snakeToCamel } from "./caseConversion"
import { createClient } from "@/utils/supabase/server"

export async function getSoil(id: string): Promise<TsoilSchema | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('soils')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      return null
    }
    
    const soil = snakeToCamel(data)
    return soil as TsoilSchema
    
  } catch {
    return null
  }
}