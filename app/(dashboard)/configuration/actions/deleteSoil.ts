"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { TsoilCalculationsSchema } from "@/schemas/soilSchemas"
import { calculateResultsForFineSoil, calculateResultsForSoils } from "@/lib/equations"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function deleteSoil(id: string, name: string, profileId: string): Promise<ReturnType> {
  console.log(`🚀 Starting deleteSoil for: ${name} (ID: ${id}) in profile: ${profileId}`)

  const supabase = await createClient()
  const {data: profileSoils, error: profileSoilsError} = await supabase
  .from("soils")
  .select("id, start_depth")
  .order('start_depth', { ascending: true })
  .eq("soil_profile_id", profileId)

  console.log(`📊 Fetched profile soils:`, profileSoils)

  if (profileSoilsError) {
    console.error(`❌ Error fetching profile soils:`, profileSoilsError)
    return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
  }

  const currentSoilIndex = profileSoils.findIndex((s) => s.id === id)
  console.log(`🔍 Current soil index: ${currentSoilIndex}`)

  if (currentSoilIndex === -1) {
    console.error(`❌ Soil with ID ${id} not found in profile`)
    return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
  }

  const currentSoil = profileSoils[currentSoilIndex]
  console.log(`🎯 Current soil to delete:`, currentSoil)

  if (currentSoilIndex + 1 < profileSoils.length) {
    const proceedingSoil = profileSoils[currentSoilIndex + 1]
    console.log(`⬇️ Found proceeding soil:`, proceedingSoil)

    const {data: proceedingSoilData, error: proceedingSoilError} = await supabase
    .from("soils")
    .select("end_depth, y_moist, y_sat, n_value, soil_type")
    .eq("id", proceedingSoil.id)
    .single()
    
    console.log(`📋 Proceeding soil data:`, proceedingSoilData)
    
    if (proceedingSoilError) {
      console.error(`❌ Error fetching proceeding soil data:`, proceedingSoilError)
      return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
    }

    const fullObject = {
      ...proceedingSoil,
      start_depth: profileSoils[currentSoilIndex].start_depth,
      ...proceedingSoilData,
    }

    console.log(`🔄 Updated proceeding soil object (with new start_depth):`, fullObject)
    console.log(`📏 Start depth changed from ${proceedingSoil.start_depth} to ${profileSoils[currentSoilIndex].start_depth}`)

    let dataToSubmit: TsoilCalculationsSchema
    if (proceedingSoilData.soil_type === "fine") {
      console.log(`🧮 Calculating results for fine soil`)
      dataToSubmit = {...fullObject, ...await calculateResultsForFineSoil(fullObject, profileId)}
    } else {
      console.log(`🧮 Calculating results for regular soil`)
      dataToSubmit = {...fullObject, ...await calculateResultsForSoils(fullObject, profileId)}
    }

    console.log(`📊 Final data to submit for proceeding soil:`, dataToSubmit)

    const { error: proceedingSoilSubmitError } = await supabase
    .from('soils')
    .update(dataToSubmit)
    .eq('id', proceedingSoil.id)

    if (proceedingSoilSubmitError){
      console.error(`❌ Error updating proceeding soil:`, proceedingSoilSubmitError)
      return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
    }

    console.log(`✅ Successfully updated proceeding soil`)
  } else {
    console.log(`📍 No proceeding soil found - this is the last soil in the profile`)
  }
    
  try {
    console.log(`🗑️ Attempting to delete soil with ID: ${id}`)
    
    const { error } = await supabase
    .from('soils')
    .delete()
    .eq('id', id)

    if (error) {
      console.error(`❌ Error deleting soil:`, error)
      return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
    }

    console.log(`✅ Successfully deleted soil: ${name}`)
  
    console.log(`🔄 Revalidating path: /configuration`)
    revalidatePath('/configuration')
    
    console.log(`🎉 deleteSoil completed successfully for: ${name}`)
    return { message: ` ${name} has been successfully deleted`}
  } 
  
  catch (error) {
    console.error(`❌ Unexpected error during soil deletion:`, error)
    return { message: `Failed to delete ${name}, please try again later.`, errors: {}}
  }
}