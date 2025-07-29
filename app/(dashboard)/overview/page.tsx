import { FolderX, ArrowBigRight} from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SoilGraph } from "./SoilGraph"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { SoilDiagram } from "./SoilDiagram"
import { Fragment } from "react"
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { ToverviewSoilProfileSchema } from "@/schemas/soilProfileSchemas"

export const metadata = {
  title: "Overview | Helical Pile Computations",
  description: "Summary of your soil profiles and pile settings",
}

async function getProfiles(): Promise<ToverviewSoilProfileSchema[]>{
  try {
    const supabase = await createClient()
    const {data, error} = await supabase
    .from("soil_profiles")
    .select("profile_name, id, water_depth, effective_pile_length, pile_stick_out")
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

async function getSoils(): Promise<ToverviewSoilSchema[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
    .from('soils')
    .select("id, soil_profile_id, soil, soil_name, soil_type, description, colour, start_depth, end_depth, n_value, y_moist, y_sat, h, su, t, shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100")
    .order('start_depth', { ascending: true })

    if (error) {
      return []
    }
    return data 
    
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
          <Link href="/configuration"><ArrowBigRight className="size-6"/>Go to Configuration</Link>
        </Button>
      </section>
    )
  }
  
  const soilsData = await getSoils()
  const soilsByProfile = Object.groupBy(soilsData, soil => soil.soil_profile_id)
  return (
    <Carousel className="w-full max-w-4xl mx-auto border">
      <CarouselContent>
        {profilesData.map((profile, index) => {
          const profileSoils = soilsByProfile[profile.id] || []
          return (
            <CarouselItem key={profile.id}>
              
              <SoilDiagram profile={profile} profileSoils={profileSoils} profileIndex={index}/>
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious/>
      <CarouselNext/>
    </Carousel>
  )
}