"use server"
import { createClient } from "@/utils/supabase/server"
import { TvisualisationSoilSchema } from "@/schemas/soilSchemas"

export async function getSoils (profileId: string, pileDiameter: number): Promise<TvisualisationSoilSchema[]> {
  try {
    const selectFields = pileDiameter === 60 ? "end_depth, shaft_capacity60, bearing_capacity60" : "end_depth, shaft_capacity100, bearing_capacity100"
    const capacityField = pileDiameter === 60 ? "shaft_capacity60" : "shaft_capacity100"

    const supabase = await createClient()
    const { data, error } = await supabase
    .from("soils")
    .select(selectFields)
    .order("end_depth", { ascending: true })
    .eq("soil_profile_id", profileId)
    .gt(capacityField, 0)

    if (error) {
      return []
    }

    return data 
  } 
  
  catch {
    return []
  }
}
