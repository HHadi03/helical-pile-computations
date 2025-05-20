import { createClient } from "@/utils/supabase/server"
import { snakeToCamel } from "./caseConversion"
import { TsoilProfileSchema } from "@/schemas/soilProfileSchema"

export async function getProfile(): Promise<TsoilProfileSchema[]>{
  try {
    const supabase = await createClient()
    const {data, error} = await supabase
    .from("soil_profiles")
    .select("*")
    .order("created_at", {ascending: true})

    if (error) {
      return []
    }

    const profiles = data.map(profile => snakeToCamel(profile))
    return profiles as TsoilProfileSchema[]

  }
  catch {
    return []
  }
}

