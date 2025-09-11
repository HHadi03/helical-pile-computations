"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function resetSelections() {

  try {
    const supabase = await createClient()
    const { error } = await supabase
    .from("selections")
    .delete()
    .not('id', 'is', null)

    if (error) {
      return { message: `Failed to delete selections, please try again later.`, errors: {}}
    }

    revalidatePath('/visualisation')
    return { message: `Selections have been successfully deleted`}
  }
  
  catch {
    return { message: `Failed to delete selections, please try again later.`, errors: {}}
  }
}