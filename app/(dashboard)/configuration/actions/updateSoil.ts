"use server"
import { soilSchema, TsoilSchema } from "@/schemas/soilSchema"
import { createClient } from "@/utils/supabase/server"
import { camelToSnake } from "@/lib/caseConversion"
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
    const supabase = await createClient()
    const { error } = await supabase
    .from('soils')
    .update(snakeCaseSoil)
    .eq('id', soil.id)
    
    if (error) {
      return { message: "Failed to update soil data. Please try again.", errors: {}}
    }
    revalidatePath('/configuration')
    return { message: "Soil data updated successfully" }

  } catch {
    return { message: "Failed to update soil data. Please try again later.", errors: {}}
  }
}