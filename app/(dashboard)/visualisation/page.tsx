import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { SoilGraph } from "../overview/SoilGraph"
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"

export const metadata = {
  title: "Visualisation | Helical Pile Computations",
  description: "View and compare your computed results as graphs",
}

async function getSoils(): Promise<ToverviewSoilSchema[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
    .from('soils')
    .select("id, soil_profile_id, soil, soil_name, soil_type, description, colour, start_depth, end_depth, n_value, y_moist, y_sat, h, su, t, shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100")
    .order('start_depth', { ascending: true })
    .eq('soil_profile_id', '87b2e785-eb9e-4d80-9171-a8753c3255e4')

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

const profieSoils = await getSoils()

  return (
    <div>
      
      <SoilGraph profileSoils={profieSoils}/>
    </div>
  )
}