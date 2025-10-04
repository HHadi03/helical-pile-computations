"use server"
import { TeditSoilParametersSchema } from "@/schemas/soilSchemas"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { calculateResultsForFineSoil, calculateResultsForSoils, calculateResultsForFineSoilCPT, calculateResultsForSoilsCPT } from "@/lib/equations"

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
      .select("y_moist, y_sat, n_value, soil_type, test_type, qs, qc, kc, ks, nk, nc, a")
      .eq("id", proceedingSoil.id)
      .single()
      
      if (proceedingSoilError) {
        return { message: `Failed to edit ${soil.soil_name ? soil.soil_name : soil.soil}, please try again later.`, errors: {}}
      }

      let fullObject = {
        start_depth: soil.end_depth,
        ...proceedingSoil,
        ...proceedingSoilData,
      }

      if (proceedingSoilData.test_type === "spt") {
        if (proceedingSoilData.soil_type === "fine") {
          fullObject = {...fullObject, ...await calculateResultsForFineSoil(fullObject, soil.soil_profile_id)}
        }

        else {
          fullObject = {...fullObject, ...await calculateResultsForSoils(fullObject, soil.soil_profile_id)}
        }
      }

      else {
        if (proceedingSoilData.soil_type === "fine") {
          const calculatedResults = await calculateResultsForFineSoilCPT(fullObject, soil.soil_profile_id)

          if (calculatedResults.su < 1) {
            return { 
              message: `Unable to modify end depth as proceeding layer has negative results, please modify its parameters.`,
              errors: { end_depth: ["End depth change leads to negative results"] }
            }
          }

          fullObject = { ...fullObject, ...calculatedResults }
        }

        else {
          fullObject = {...fullObject, ...await calculateResultsForSoilsCPT(fullObject, soil.soil_profile_id)}
        }
      }
  
      const { error: proceedingSoilSubmitError } = await supabase
      .from('soils')
      .update(fullObject)
      .eq('id', proceedingSoil.id)

      if (proceedingSoilSubmitError){
        return { message: `Failed to edit ${soil.soil_name ? soil.soil_name : soil.soil}, please try again later.`, errors: {}}
      }
    }
  }
  
  if (soil.test_type === "spt") {
    if (soil.soil_type === "fine") {
      soil = { ...soil,...await calculateResultsForFineSoil(soil,  soil.soil_profile_id)}
    }

    else {
      soil = { ...soil,...await calculateResultsForSoils(soil,  soil.soil_profile_id)}
    }
  }
  
  else {
    if (soil.soil_type === "fine") {
      const calculatedResults = await calculateResultsForFineSoilCPT(soil, soil.soil_profile_id)

      if (calculatedResults.su < 1) {
        return { 
          message: `Cone tip resistance value is too low, leading to negative results.`, 
          errors: { qc: [`Cone tip resistance value is too low`] }
        }
      }

      soil = { ...soil, ...calculatedResults }
    }

    else {
      soil = { ...soil,...await calculateResultsForSoilsCPT(soil,  soil.soil_profile_id)}
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