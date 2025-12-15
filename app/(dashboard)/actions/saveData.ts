"use server"

import { createClient } from "@/utils/supabase/server"

export async function SaveData() {
  const supabase = await createClient()

  // Query all three tables
  const [soilProfilesResult, soilsResult, selectionsResult] = await Promise.all([
    supabase.from("soil_profiles").select("*"),
    supabase.from("soils").select("*"),
    supabase.from("selections").select("*")
  ])

  // Check for errors
  if (soilProfilesResult.error) throw new Error(soilProfilesResult.error.message)
  if (soilsResult.error) throw new Error(soilsResult.error.message)
  if (selectionsResult.error) throw new Error(selectionsResult.error.message)

  // Build save data structure
  const saveData = {
    version: "1.0",
    timestamp: new Date().toISOString(),
    tables: {
      soil_profiles: soilProfilesResult.data,
      soils: soilsResult.data,
      selections: selectionsResult.data
    }
  }

  // Return as JSON string
  return JSON.stringify(saveData, null, 2)
}