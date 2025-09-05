import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowBigRight, FolderOpen, FolderX } from "lucide-react"
import { TconfigSoilProfileSchema, TselectionsSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import Link from "next/link"
import { VisulisationComponent } from "./VisulisationComponent"

export const metadata = {
  title: "Visualisation | Helical Pile Computations",
  description: "Visualise a selection of your soil profiles computed results.",
}

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

async function getSelections(): Promise<TselectionsSoilProfileSchema[]> {
  try {
    const supabase = await createClient()
    const {data, error} = await supabase
    .from("selections")
    .select("id, pile_diameter, colour, stroke_width")

    if (error) {
      return []
    }

    return data
  }

  catch {
    return []
  }
}

export default async function VisualisationPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/')
  }

  const profilesData = await getProfiles()
  if (profilesData.length === 0) {
    return (
      <section className="bg-secondary border-2 border-foreground flex flex-col items-center text-center justify-center min-h-full p-5">
        <FolderX className="size-10 text-muted-foreground mb-2"/>
        <h3 className="text-2xl font-semibold mb-2">No Soil Profiles Found</h3>
        <p className="mb-4 text-muted-foreground">Go to configuration to add a soil profile or load previously saved soil profiles</p>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild className="w-45">
            <Link href="/configuration"><ArrowBigRight className="size-6"/>Go to Configuration</Link>
          </Button>
          <Button asChild variant="outline" className="w-45">
            <Link href="/load" prefetch={true} scroll={false}><FolderOpen className="size-6"/>Load Saved Data</Link>
          </Button>
        </div>
      </section>
    )
  }

  const selectionsData = await getSelections()

  if (!selectionsData || selectionsData.length === 0) {
    return (
      <VisulisationComponent profilesData={profilesData} initialDialogOpen={true} />
    )
  }
  
  return (
    <div>
      Rendering visualisation graph....
    </div>
  )
    
  
}

