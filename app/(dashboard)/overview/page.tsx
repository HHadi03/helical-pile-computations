import { FolderX, ArrowBigRight} from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SoilGraph } from "./SoilGraph"
import { SoilDiagram } from "./SoilDiagram"
import { ToggleButton } from "./ToggleButton"
import { Fragment } from "react"
import { TsoilSchema } from "@/schemas/soilSchema"
import { TsoilProfileSchema } from "@/schemas/soilProfileSchema"
import { snakeToCamel } from "@/lib/caseConversion"

export const metadata = {
  title: "Overview | Helical Pile Computations",
  description: "Summary of your soil profiles and pile settings",
}

async function getProfiles(): Promise<TsoilProfileSchema[]>{
  try {
    const supabase = await createClient()
    const {data, error} = await supabase
    .from("soil_profiles")
    .select("profile_name, id, water_depth, pile_length, pile_stick_out")
    .order("created_at", { ascending: true })

    if (error || !data) {
      return []
    }

    const profiles = data.map(profile => snakeToCamel(profile))
    return profiles as TsoilProfileSchema[]

  }
  catch {
    return []
  }
}

async function getSoils(): Promise<TsoilSchema[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('soils')
      .select("id, soil, soil_name, description, colour, start_depth, end_depth, n_value, y_moist, y_sat, soil_profile_id, h, su, t, shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100")
      .order('start_depth', { ascending: true })

    if (error || !data) {
      return []
    }
    
    const soils = data.map(soil => snakeToCamel(soil))
    return soils as TsoilSchema[]
    
  } catch {
    return []
  }
}

export default async function OverviewPage() {
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
        <p className="mb-4 text-muted-foreground">Head to the configuration page to add your first soil profile</p>
        <Button asChild className="w-80">
          <Link href="/configuration" prefetch={true} scroll={false}><ArrowBigRight className="size-6"/>Go to Configuration</Link>
        </Button>
      </section>
    )
  }
  
  const soilsData = await getSoils()
  const soilsByProfile = Object.groupBy(soilsData, soil => soil.soilProfileId!)
  return (
    <>
      {profilesData.map((profile, index) => {
        const profileSoils = soilsByProfile[profile.id!] || []
        return (
          <Fragment key={profile.id}>
            <ToggleButton>
              <SoilDiagram profile={profile} profileSoils={profileSoils} index={index}/>
              <SoilGraph profileSoils={profileSoils}/>
            </ToggleButton>
          </Fragment>
        )
      })}
    </>
  )
}