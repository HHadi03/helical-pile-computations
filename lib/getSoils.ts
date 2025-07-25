import { TsoilSchema } from "@/schemas/soilSchemas" 
import { snakeToCamel } from "./caseConversion"
import { createClient } from "@/utils/supabase/server"

export async function getSoils(): Promise<TsoilSchema[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('soils')
      .select('*')
      .order('start_depth', { ascending: true })
  
    if (error || !data) {
      return []
    }

    const soils = data.map(soil => snakeToCamel(soil))
    return soils as TsoilSchema[]
    
  } catch {
    return []
  }
}