"use server"
import { TsoilSchema } from "@/schemas/soilSchema"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function updateSoil(soil: TsoilSchema): Promise<ReturnType> {
  
  if (soil.soilName) {
    soil = {...soil, soilName: soil.soilName.charAt(0).toUpperCase() + soil.soilName.slice(1)}
  }

  try {
    const snakeCaseSoil = camelToSnake(soil)
    const supabase = await createClient()
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