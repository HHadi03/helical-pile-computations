"use server"
import { TEngineeredSoilSchema } from "@/schemas/engineeredSoilSchema"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function updateSoilEngineered(soil: TEngineeredSoilSchema): Promise<ReturnType> {
  
  const supabase = await createClient()
  const { data: soilData } = await supabase
  .from('soils')
  .select("su, t, angle")
  .eq('id', soil.id)
  .single()
  
  const { data: pileData } = await supabase
  .from('soils')
  .select("effective_pile_length")
  .eq('id', soil.soilProfileId)
  .single()
  
  let soilHeight: number
  if (soil.endDepth! <= pileData?.effective_pile_length) {
    soilHeight = soil.h!
  }

  else if (soil.startDepth! < pileData?.effective_pile_length) {
    soilHeight = pileData?.effective_pile_length - soil.startDepth!
  }

  else {
    soilHeight = 0
  }

  if (soilHeight > 0) {
  
    if (soil.soilType !== 'fine' && soil.angle !== soilData?.angle) {
      
    }
    
    else if (soil.soilType !== 'fine' && soil.t !== soilData?.t) {

    }

    else (
      
    )

  }
  
  try {
    const snakeCaseSoil = camelToSnake(soil)
    const { error } = await supabase
    .from('soils')
    .update(snakeCaseSoil)
    .eq('id', soil.id)
    
    if (error) {
      return { message: `Failed to edit ${soil.soilName ? soil.soilName : soil.soil}, please try again later.`, errors: {}}
    }

    revalidatePath('/configuration')
    return { message: `${soil.soilName ? soil.soilName : soil.soil} has been successfully edited` }
  } 
  
  catch {
    return { message: `Failed to edit ${soil.soilName ? soil.soilName : soil.soil}, please try again later.`, errors: {}}
  }
}