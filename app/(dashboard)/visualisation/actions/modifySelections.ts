"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function modifySelections(selectionsToDelete: string[], selectionsToEdit: [string, { colour?: string; stroke_width?: number }][]) {
  try {
    const supabase = await createClient()
    
    let deleteResults: boolean[] = []
    let updateResults: boolean[] = []

    if (selectionsToDelete.length > 0) {
      deleteResults = await Promise.all(selectionsToDelete.map(async (id) => {
        const { error } = await supabase
        .from("selections")
        .delete()
        .eq("id", id)
        return !error
      }))
    }
    
    if (selectionsToEdit.length > 0) {
      updateResults = await Promise.all(selectionsToEdit.map(async ([id, updates]) => {
        const { colour, stroke_width } = updates

        if (!colour && stroke_width === undefined) return true

        const { error } = await supabase
        .from("selections")
        .update({ colour, stroke_width })
        .eq("id", id)
        return !error
      }))
    }

    const allSuccessful = [...deleteResults, ...updateResults].every(success => success)

    if (!allSuccessful) {
      return { message: "Failed to edit selections, please try again later.", errors: {} }
    }

    revalidatePath("/visualisation")
    return { message: "Selections have been successfully edited" }
  } 
  
  catch  {
    return { message: "Failed to edit selections, please try again later.", errors: {} }
  }
}