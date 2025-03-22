import { supabase } from "../lib/supabaseClient"
import { TsoilSchema } from "@/schemas/soilSchema" 
import { snakeToCamel } from "../lib/caseConversion"

export async function getSoils(): Promise<TsoilSchema[]> {
  try {
    const { data, error } = await supabase
      .from('soils')
      .select('*')
      .order('start_depth', { ascending: true })
  
    if (error) {
      console.error('Error fetching soils:', error)
      return []
    }

    const soils = data.map(soil => {return snakeToCamel(soil)})
    return soils as TsoilSchema[]
    
  } catch (error) {
    console.error('Error processing soils data:', error)
    return []
  }
}