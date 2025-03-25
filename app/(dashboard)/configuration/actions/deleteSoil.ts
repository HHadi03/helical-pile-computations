"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { getSoils } from "@/lib/getSoils"
import { getPile } from "@/lib/getPile"

type ReturnType = {
  message: string
  errors?: Record<string, string[]>
}

export async function deleteSoil(id: string): Promise<ReturnType> {
  if (!id) {
    return {
      message: "Invalid Soil ID detected.",
      errors: {id: ["Soil ID is required for deletion"]}
    }
  }

  try {
    const soilsData = await getSoils()
    const supabase = await createClient()
    const { error } = await supabase
    .from('soils')
    .delete()
    .eq('id', id)

    if (error) {
      return { message: "Failed to delete soil. Please try again.", errors: {}}
    }
    
    if (soilsData.length > 1) {
      const pileData = await getPile()
      const previousSoil = soilsData[soilsData.length - 2]
      const newPileLength = previousSoil.endDepth
      
      if (pileData) {
        await supabase
        .from('pile')
        .update({ pile_length: newPileLength })
        .eq('id', '1')
      }
    }
    
    revalidatePath('/configuration')
    return { message: "Soil deleted successfully" }

  } catch {
    return { message: "Failed to delete soil. Please try again later.", errors: {}}
  }
}