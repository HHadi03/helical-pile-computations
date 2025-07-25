"use server"
import { TeditSoilEngineeredSchema } from "@/schemas/soilSchemas"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { roundToTwoDecimals, calculateSoilHeight } from "@/lib/equations"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

type SoilWithCalculations = TeditSoilEngineeredSchema & {
  bearing_capacity60: number
  bearing_capacity100: number
  shaft_capacity60?: number
  shaft_capacity100?: number
  ko?: number
  t?: number | null  
}

type DirtyFields = Partial<Record<keyof TeditSoilEngineeredSchema, boolean>>

const pileDiameter60 = 0.1884
const pileDiameter100 = 0.314
const pileAreaDiameter60 = 0.001223
const pileAreaDiameter100 = 0.002463

export async function updateSoilEngineered(soil: TeditSoilEngineeredSchema, soilId: string, dirtyFields: DirtyFields = {}): Promise<ReturnType> {
  const supabase = await createClient()

  const { data: soilData, error: soilError } = await supabase
  .from('soils')
  .select("soil, soil_name, soil_profile_id, start_depth, end_depth, po, h")
  .eq('id', soilId)
  .single()

  if (soilError) {
    return { message: `Failed to fetch soil layer.`, errors: {}}
  }

  const { data: pileData, error: pileError } = await supabase
  .from('soil_profiles')
  .select("effective_pile_length")
  .eq('id', soilData.soil_profile_id)
  .single()

  if (pileError) {
    return { message: `Failed to fetch pile data.`, errors: {}}
  }

  const soilHeight = calculateSoilHeight(soilData.start_depth, soilData.end_depth, soilData.h, pileData.effective_pile_length)

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
        const Ko = 0.09 * Math.exp(0.08 * soil.angle!)
        const newT = Ko * soilData.po * Math.tan(soil.angle! * (Math.PI / 180))
        updatePayload.ko = roundToTwoDecimals(Ko)
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
      return { message: `Failed to edit ${soilData.soil_name ? soilData.soil_name: soilData.soil}, please try again later.`, errors: {}}
    }

    revalidatePath('/configuration')
    return { message: `${soilData.soil_name ? soilData.soil_name: soilData.soil} has been successfully edited` }
  } 
  
  catch {
    return { message: `Failed to edit ${soilData.soil_name ? soilData.soil_name: soilData.soil}, please try again later.`, errors: {}}
  }
}