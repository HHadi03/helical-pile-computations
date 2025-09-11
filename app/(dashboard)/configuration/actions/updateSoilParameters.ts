"use server"
import { TeditSoilParametersSchema, TsoilCalculationsSchema } from "@/schemas/soilSchemas"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { calculateResultsForFineSoil, calculateResultsForSoils } from "@/lib/equations"

type DirtyFields = Partial<Record<keyof TeditSoilParametersSchema, boolean>>

export async function updateSoilParameters(soil: TeditSoilParametersSchema, soilId: string, dirtyFields: DirtyFields = {}) {

  if (dirtyFields.end_depth) {
    const supabase = await createClient()
    const {data: profileSoils, error: profileSoilsError} = await supabase
    .from("soils")
    .select("id, end_depth")
    .order('end_depth', { ascending: true })
    .eq("soil_profile_id", soil.soil_profile_id)

    if (profileSoilsError) {
      return { message: `Failed to edit ${soil.soil_name ? soil.soil_name : soil.soil}, please try again later.`, errors: {}}
    }

    const currentSoilIndex = profileSoils.findIndex((s) => s.id === soilId)
 
    if (currentSoilIndex === -1) {
      return { message: `Failed to edit ${soil.soil_name ? soil.soil_name : soil.soil}, please try again later.`, errors: {}}
    }

    if (currentSoilIndex + 1 < profileSoils.length) {
      const proceedingSoil = profileSoils[currentSoilIndex + 1]
      
      if (soil.end_depth >= proceedingSoil.end_depth) {
        return { message: `End depth must be smaller than the end depth of the subsequent soil layer.`, 
          errors: { end_depth: [`End depth must be less than ${proceedingSoil.end_depth}m`] }
        }
      }

      const {data: proceedingSoilData, error: proceedingSoilError} = await supabase
      .from("soils")
      .select("y_moist, y_sat, n_value, soil_type")
      .eq("id", proceedingSoil.id)
      .single()
      
      if (proceedingSoilError) {
        return { message: `Failed to edit ${soil.soil_name ? soil.soil_name : soil.soil}, please try again later.`, errors: {}}
      }

      const fullObject = {
        ...proceedingSoil,
        start_depth: soil.end_depth, 
        ...proceedingSoilData,
      }

      let dataToSubmit: TsoilCalculationsSchema
      if (proceedingSoilData.soil_type === "fine") {
        dataToSubmit = {...fullObject, ...await calculateResultsForFineSoil(fullObject, soil.soil_profile_id!)}
      }

      else {
        dataToSubmit = {...fullObject, ...await calculateResultsForSoils(fullObject, soil.soil_profile_id!)}
      }
  
      const { error: proceedingSoilSubmitError } = await supabase
      .from('soils')
      .update(dataToSubmit)
      .eq('id', proceedingSoil.id)

      if (proceedingSoilSubmitError){
        return { message: `Failed to edit ${soil.soil_name ? soil.soil_name : soil.soil}, please try again later.`, errors: {}}
      }
    }
  }

  if (soil.soil_type === "fine") {
    soil = { ...soil,...await calculateResultsForFineSoil(soil, soil.soil_profile_id!)}
  }
  
  else {
    soil = { ...soil,...await calculateResultsForSoils(soil, soil.soil_profile_id!)}
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