import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { VisulisationComponent } from "./VisulisationComponent"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Visualisation | Helical Pile Computations",
  description: "View and compare your computed results as graphs.",
}

async function getProfiles(): Promise<any[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("soil_profiles")
      .select("profile_name, id, effective_pile_length")
      .order("created_at", { ascending: true })

    if (error) {
      return []
    }
    return data
  } catch {
    return []
  }
}

async function getSoils(profileId: string): Promise<any[]> {
  "use server"
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('soils')
      .select("id, start_depth, end_depth, shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100")
      .order('start_depth', { ascending: true })
      .eq('soil_profile_id', profileId)

    if (error) {
      return []
    }
    return data
  } catch {
    return []
  }
}

export default async function VisualisationPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/")
  }

  const profiles = await getProfiles()

  return (
    <div>
      <VisulisationComponent 
        profiles={profiles}
        getSoilsAction={getSoils}
      />
    </div>
  )
}