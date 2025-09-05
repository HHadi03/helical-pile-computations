"use server"
import { createClient } from "@/utils/supabase/server"
import { TvisualisationSoilSchema } from "@/schemas/soilSchemas"
import { revalidatePath } from "next/cache"

export async function getSoils (profileId: string, pileSize: string): Promise<TvisualisationSoilSchema[]> {
  try {
    const selectFields = pileSize === "60" ? "start_depth, end_depth, shaft_capacity60, bearing_capacity60" : "start_depth, end_depth, shaft_capacity100, bearing_capacity100"
    const capacityField = pileSize === "60" ? "shaft_capacity60" : "shaft_capacity100"

    const supabase = await createClient()
    const { data, error } = await supabase
    .from("soils")
    .select(selectFields)
    .order("start_depth", { ascending: true })
    .eq("soil_profile_id", profileId)
    .gt(capacityField, 0)

    if (error) {
      return []
    }
    revalidatePath("/visualisation")
    return data 
  } 
  
  catch {
    return []
  }
}
