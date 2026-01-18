"use server"
import { TeditSoilInformationSchema } from "@/schemas/soilSchemas"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { calculateResultsForFineSoil, calculateResultsForSoils, calculateResultsForFineSoilCPT, calculateResultsForSoilsCPT } from "@/lib/equations"
import { capitaliseFirstLetter } from "@/lib/utils"

type DirtyFields = Partial<Record<keyof TeditSoilInformationSchema, boolean>>

export async function updateSoilInformation(soil: TeditSoilInformationSchema, soilId: string,  dirtyFields: DirtyFields = {}) {

  if (soil.soil_name && dirtyFields.soil_name) {
    soil = {...soil, soil_name: capitaliseFirstLetter(soil.soil_name)}
  }

  if (dirtyFields.soil_type) {
    const supabase = await createClient()
    const { data, error } = await supabase
    .from('soils')
    .select("start_depth, end_depth, y_moist, y_sat, n_value, test_type, qca, qc, kc, a, soil_profile_id")
    .eq('id', soilId)
    .single()
    
    if (error) {
      return { message: `Failed to edit ${soil.soil_name ? soil.soil_name : soil.soil}, please try again later.`, errors: {}}
    }
    
    if (data.test_type === "spt") {
      if (soil.soil_type === "fine") {
        soil = { ...soil,...await calculateResultsForFineSoil(data, data.soil_profile_id)}
      }
        
      else {
        soil = { ...soil,...await calculateResultsForSoils(data, data.soil_profile_id)}
      }
    }

    else {
      if (soil.soil_type === "fine") {
        soil = { ...soil,...await calculateResultsForFineSoilCPT(data, data.soil_profile_id)}
      }
      
      else {
        soil = { ...soil,...await calculateResultsForSoilsCPT(data, data.soil_profile_id)}
      }
    }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
    .from('soils')
    .update(soil)
    .eq('id', soilId)
    
    if (error) {
      return { message: `Failed to edit ${soil.soil_name ? soil.soil_name : soil.soil}, please try again later.`, errors: {}}
    }

    revalidatePath('/configuration')
    return { message: `${soil.soil_name ? soil.soil_name : soil.soil} has been successfully edited` }
  } 
  
  catch {
    return { message: `Failed to edit ${soil.soil_name ? soil.soil_name : soil.soil}, please try again later.`, errors: {}}
  }
}