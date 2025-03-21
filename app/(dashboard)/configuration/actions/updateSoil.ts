"use server"
import { soilSchema, TsoilSchema } from "@/app/schemas/soilSchema"
import { supabase } from "@/app/lib/supabaseClient"
import { camelToSnake } from "@/app/lib/caseConversion"
import { revalidatePath } from "next/cache"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function updateSoil(soil: TsoilSchema): Promise<ReturnType> {
  const parsed = soilSchema.safeParse(soil)
  if (!parsed.success) {
    return {
      message: "Please check the highlighted fields and try again.",
      errors: parsed.error.flatten().fieldErrors
    }
  }
 
  try {
    const snakeCaseSoil = camelToSnake(soil)
    const { error } = await supabase
      .from('soils')
      .update(snakeCaseSoil)
      .eq('id', soil.id)
    
    if (error) {
      return { message: "Failed to update soil data. Please try again.", errors: {}}
    }
    revalidatePath('/configuration')
    return { message: "Soil data updated successfully" }

  } catch (error) {
    return { message: "Failed to update soil data. Please try again later.", errors: {}}
  }
}