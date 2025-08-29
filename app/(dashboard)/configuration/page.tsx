import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { TconfigSoilSchema } from "@/schemas/soilSchemas"
import { ConfigurationComponent } from "./ConfigurationComponent"
import { Plus, FolderX, FolderOpen } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TconfigSoilProfileSchema } from "@/schemas/soilProfileSchemas"

async function getProfiles(): Promise<TconfigSoilProfileSchema[]>{
  try {
    const supabase = await createClient()
    const {data, error} = await supabase
    .from("soil_profiles")
    .select("profile_name, id")
    .order("created_at", { ascending: true })

    if (error) {
      return []
    }
    return data
    
  }
  catch {
    return []
  }
}

async function getSoils(): Promise<TconfigSoilSchema[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('soils')
      .select("id, soil_profile_id, soil_type, density, soil, soil_name, description, start_depth, end_depth, n_value, y_moist, y_sat")
      .order('start_depth', { ascending: true })

    if (error) {
      return []
    }
    return data
    
  } catch {
    return []
  }
}

export default async function ConfigurationPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }
  
  const profilesData = await getProfiles()

  if (profilesData.length === 0) {
    return (
      <section className="bg-secondary border-2 border-foreground flex flex-col items-center text-center justify-center min-h-full p-5">
        <FolderX className="size-10 text-muted-foreground mb-2"/>
        <h3 className="text-2xl font-semibold mb-2">No Soil Profiles Found</h3>
        <p className="mb-4 text-muted-foreground">Start by adding a new soil profile or by loading previously saved soil profiles</p>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild className="w-45"> 
            <Link href="/configuration/insert-profile" prefetch={true} scroll={false}><Plus className="size-6"/>Add Soil Profile</Link>
          </Button>
          <Button asChild variant="outline" className="w-45">
            <Link href="/load" prefetch={true} scroll={false}><FolderOpen className="size-6"/>Load Saved Data</Link>
          </Button>
        </div>
      </section>
    )
  }

  const soilsData = await getSoils()
  return (
    <ConfigurationComponent soilsData={soilsData} profilesData={profilesData}/>
  )
}