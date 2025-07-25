import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { TconfigSoilSchema } from "@/schemas/soilSchemas"
import { ConfigAccordion } from "./ConfigAccordion"
import { Plus, FolderX, ShieldCheck, PlusCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TconfigSoilProfileSchema } from "@/schemas/soilProfileSchemas"

export const metadata = {
  title: "Configuration | Helical Pile Computations",
  description: "Set up soil profiles and piles for analysis",
}

async function getProfiles(): Promise<TconfigSoilProfileSchema[]>{
  try {
    const supabase = await createClient()
    const {data, error} = await supabase
    .from("soil_profiles")
    .select("profile_name, id, created_at")
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
        <p className="mb-4 text-muted-foreground">Start by adding a new soil profile to configure soil layers for analysis</p>
        <Button asChild className="w-80">
          <Link href="/configuration/insert-profile" prefetch={true} scroll={false}><Plus className="size-6"/>Add Soil Profile</Link>
        </Button>
      </section>
    )
  }

  const soilsData = await getSoils()
  return (
    <section className="min-h-full flex flex-col">
      
      <div className="mb-3 flex flex-col sm:flex-row sm:justify-end sm:gap-5">
        <Button asChild variant="outline" className="sm:w-58 hover:bg-blue-200 dark:hover:bg-blue-900/50 shadow-sm" size="lg">
          <Link href="/configuration/design-methods" prefetch={false} scroll={false}><ShieldCheck className='size-5 text-blue-700'/>Determine Design Methods</Link>
        </Button>

        <Button asChild variant="outline" className="mt-2 sm:w-58 sm:mt-0 hover:bg-green-200 dark:hover:bg-green-900/50 shadow-sm" size="lg">
          <Link href="/configuration/insert-profile" prefetch={true} scroll={false}><PlusCircle className="size-5 text-green-700"/>Add Soil Profile</Link>
        </Button>
      </div>

      <ConfigAccordion soilsData={soilsData} profilesData={profilesData}/>
    </section>
  )
}