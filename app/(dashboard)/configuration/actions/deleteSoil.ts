"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { TsoilCalculationsSchema } from "@/schemas/soilSchemas"
import { calculateResultsForFineSoil, calculateResultsForSoils } from "@/lib/equations"

export async function deleteSoil(id: string, name: string, profileId: string) {

  const supabase = await createClient()
  const {data: profileSoils, error: profileSoilsError} = await supabase
  .from("soils")
  .select("id, start_depth")
  .order('start_depth', { ascending: true })
  .eq("soil_profile_id", profileId)

  if (profileSoilsError) {
    return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
  }

  const currentSoilIndex = profileSoils.findIndex((s) => s.id === id)

  if (currentSoilIndex === -1) {
    return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
  }

  if (currentSoilIndex + 1 < profileSoils.length) {
    const proceedingSoil = profileSoils[currentSoilIndex + 1]

    const {data: proceedingSoilData, error: proceedingSoilError} = await supabase
    .from("soils")
    .select("end_depth, y_moist, y_sat, n_value, soil_type")
    .eq("id", proceedingSoil.id)
    .single()
    
    if (proceedingSoilError) {
      return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
    }

    const fullObject = {
      ...proceedingSoil,
      start_depth: profileSoils[currentSoilIndex].start_depth,
      ...proceedingSoilData,
    }

    let dataToSubmit: TsoilCalculationsSchema
    if (proceedingSoilData.soil_type === "fine") {
      dataToSubmit = {...fullObject, ...await calculateResultsForFineSoil(fullObject, profileId)}
    }

    else {
      dataToSubmit = {...fullObject, ...await calculateResultsForSoils(fullObject, profileId)}
    }

    const { error: proceedingSoilSubmitError } = await supabase
    .from('soils')
    .update(dataToSubmit)
    .eq('id', proceedingSoil.id)

    if (proceedingSoilSubmitError){
      return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
    }
  }
    
  try {
    const { error } = await supabase
    .from('soils')
    .delete()
    .eq('id', id)

    if (error) {
      return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
    }
  
    revalidatePath('/configuration')
    return { message: ` ${name} has been successfully deleted`}
  } 
  
  catch {
    return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
  }
}