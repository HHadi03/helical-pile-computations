import {TsoilSchema } from "@/schemas/soilSchema"
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
    
    if (error) {
      console.error(`Error fetching soil with id ${id}:`, error)
      return null
    }
    
    const soil = snakeToCamel(data)
    return soil as TsoilSchema
    
  } catch (error) {
    console.error(`Error processing soil data for id ${id}:`, error)
    return null
  }
}