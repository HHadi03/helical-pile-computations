"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { ToverviewSoilProfileSchema, TvisualisationSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { TfullSoilSchema } from "@/schemas/soilSchemas"

interface SaveDataStructure {
  version: string
  timestamp: string
  tables: {
    soil_profiles: ToverviewSoilProfileSchema[]
    soils: TfullSoilSchema[]
    selections: TvisualisationSoilProfileSchema[]
  }
}

export async function LoadData(jsonData: SaveDataStructure) {
  const supabase = await createClient()

  // Validate the data structure
  if (!jsonData.tables || !jsonData.tables.soil_profiles || !jsonData.tables.soils || !jsonData.tables.selections) {
    throw new Error("Invalid save file format")
  }

  // Delete existing data from all tables
  const [deleteProfiles, deleteSoils, deleteSelections] = await Promise.all([
    supabase.from("soil_profiles").delete().not("id", "is", null),
    supabase.from("soils").delete().not("id", "is", null),
    supabase.from("selections").delete().not("id", "is", null),
  ])

  if (deleteProfiles.error) throw new Error(deleteProfiles.error.message)
  if (deleteSoils.error) throw new Error(deleteSoils.error.message)
  if (deleteSelections.error) throw new Error(deleteSelections.error.message)

  // Insert parents first
const insertProfiles = await supabase
  .from("soil_profiles")
  .insert(jsonData.tables.soil_profiles)

if (insertProfiles.error) {
  throw new Error(insertProfiles.error.message)
}

// Then children
const insertSoils = await supabase
  .from("soils")
  .insert(jsonData.tables.soils)

if (insertSoils.error) {
  throw new Error(insertSoils.error.message)
}

const insertSelections = await supabase
  .from("selections")
  .insert(jsonData.tables.selections)

if (insertSelections.error) {
  throw new Error(insertSelections.error.message)
}

revalidatePath('/')
  return { success: true }
}