"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { randomColorPicker } from "@/lib/utils"

export async function insertSelections (selections: string[]) {
  
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  const insertingSelections = await Promise.all(selections.map(async (selection) => {
    try {
      const profileId = selection.slice(0, 36)
      const pileDiameter = Number(selection.split("-").pop())

      const fullSelectObject = {
        user_id: data?.claims.sub,
        soil_profile_id: profileId,
        pile_diameter: pileDiameter,
        colour: randomColorPicker(),
        stroke_width: 1
      }

      const { error } = await supabase
      .from("selections")
      .insert(fullSelectObject)

      return !error
    }
    
    catch {
      return false
    }
  }))
  
  const allSuccessful = insertingSelections.every((success) => success)

  if (!allSuccessful) {
    return { message: `Failed to save selections, please try again later.`, errors: {}}
  }

  revalidatePath("/visualisation")
  return { message: "Selections have been successfully saved" } 
}
