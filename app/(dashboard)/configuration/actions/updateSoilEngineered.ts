"use server"
import { TeditSoilEngineeredSchema } from "@/schemas/soilSchemas"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { roundToTwoDecimals, calculateSoilHeight, roundToOneDecimal } from "@/lib/utils"
import { pileDiameter60, pileDiameter100, pileAreaDiameter60, pileAreaDiameter100 } from "@/lib/equations"

type SoilWithCalculations = TeditSoilEngineeredSchema & {
  bearing_capacity60: number
  bearing_capacity100: number
  shaft_capacity60: number
  shaft_capacity100: number
}

type DirtyFields = Partial<Record<keyof TeditSoilEngineeredSchema, boolean>>

export async function updateSoilEngineered(soil: TeditSoilEngineeredSchema, soilId: string, dirtyFields: DirtyFields = {}) {
  
  const supabase = await createClient()
  const { data, error } = await supabase
  .from('soils')
  .select(`soil, soil_name, start_depth, end_depth, po, soil_profile_id`)
  .eq('id', soilId)
  .single()

  if (error) {
    return { message: `Failed to fetch neccessary soil data, please try again later.`, errors: {}}
  }

  const { data: pileLength, error: pileLengthError } = await supabase
  .from('soil_profiles')
  .select(`effective_pile_length`)
  .eq('id', data.soil_profile_id)
  .single()
  
  if (pileLengthError) {
    return { message: `Failed to fetch effective pile length, please try again later.`, errors: {}}
  }

  const h = roundToOneDecimal(data.end_depth - data.start_depth)
  const soilHeight = calculateSoilHeight(data.start_depth, data.end_depth, h, pileLength.effective_pile_length)

  const updatePayload: Partial<SoilWithCalculations> = { ...soil }
  if (soilHeight > 0) {
    
    if (dirtyFields.qult) {
      updatePayload.bearing_capacity60 = roundToTwoDecimals(soil.qult * pileAreaDiameter60)
      updatePayload.bearing_capacity100 = roundToTwoDecimals(soil.qult * pileAreaDiameter100)
    }

    if (soil.soil_type !== 'fine') {
      if (dirtyFields.t) {
        updatePayload.shaft_capacity60 = roundToTwoDecimals(soil.t! * soilHeight * pileDiameter60)
        updatePayload.shaft_capacity100 = roundToTwoDecimals(soil.t! * soilHeight * pileDiameter100)
      } 
      
      else if (dirtyFields.angle) {
        const Ko = roundToTwoDecimals(0.09 * Math.exp(0.08 * soil.angle!))
        const newT = roundToTwoDecimals(Ko * data.po * Math.tan(soil.angle! * (Math.PI / 180)))
        updatePayload.t = roundToTwoDecimals(newT)
        updatePayload.shaft_capacity60 = roundToTwoDecimals(newT * soilHeight * pileDiameter60)
        updatePayload.shaft_capacity100 = roundToTwoDecimals(newT * soilHeight * pileDiameter100)
      }
    } 
    
    else {
      if (dirtyFields.su) {
        updatePayload.shaft_capacity60 = roundToTwoDecimals(soil.su! * soilHeight * pileDiameter60)
        updatePayload.shaft_capacity100 = roundToTwoDecimals(soil.su! * soilHeight * pileDiameter100)
      }
    }

  } 
  
  else {
    updatePayload.bearing_capacity60 = 0
    updatePayload.bearing_capacity100 = 0
    updatePayload.shaft_capacity60 = 0
    updatePayload.shaft_capacity100 = 0
  }
  
  try {
    const { error } = await supabase
    .from('soils')
    .update(updatePayload)
    .eq('id', soilId)
    
    if (error) {
      return { message: `Failed to edit ${data.soil_name ? data.soil_name: data.soil}, please try again later.`, errors: {}}
    }

    revalidatePath('/configuration')
    return { message: `${data.soil_name ? data.soil_name: data.soil} has been successfully edited` }
  } 
  
  catch {
    return { message: `Failed to edit ${data.soil_name ? data.soil_name: data.soil}, please try again later.`, errors: {}}
  }
}