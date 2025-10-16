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
    .select("start_depth, end_depth, y_moist, y_sat, n_value, test_type, qs, qc, kc, ks, nk, nc, a, soil_profile_id")
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
        const calculatedResults = await calculateResultsForFineSoilCPT(data, data.soil_profile_id)

        if (calculatedResults.su < 0) {
          return { 
            message: `Unable to modify soil type as layer has negative results, please modify its parameters.`,
            errors: { soil_type: ["Soil type change leads to negative results"] } 
          }
        }
        
        soil = { ...soil, ...calculatedResults }
      }
      
      else {
        const dataWithDefaults = {...data, qs: (data.qs > 0) ? data.qs : Math.max(data.qc * 0.01, 50)}
        soil = { ...soil, qs: dataWithDefaults.qs, ...await calculateResultsForSoilsCPT(dataWithDefaults, data.soil_profile_id)}
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