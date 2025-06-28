import { getSoils } from "@/lib/getSoils"
import { getProfiles } from "@/lib/getProfiles"
import { FolderX, ArrowBigRight} from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SoilGraph } from "./SoilGraph"
import { SoilDiagram } from "./SoilDiagram"
import { ToggleButton } from "./ToggleButton"

export const metadata = {
  title: "Overview | Helical Pile Computations",
  description: "Summary of your soil profiles and pile settings",
}

export default async function OverviewPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser() 
  if (error || !data?.user) {
    redirect('/')
  }

  const profilesData = await getProfiles()
  const soilsData = await getSoils()

  if (profilesData.length === 0) {
    return (
      <section className="flex items-center justify-center h-full bg-secondary border-2 border-foreground overflow-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">
        <div className="flex flex-col text-center items-center">
          <span className="flex justify-center mb-2"><FolderX className="size-10 text-muted-foreground"/></span>
          <h3 className="text-2xl font-semibold mb-2">No Soil Profiles Found</h3>
          <p className="mb-4 text-muted-foreground">Head to the configuration page to add your first soil profile</p>
          <Button asChild className="w-80">
            <Link href="/configuration" prefetch={true} scroll={false}><ArrowBigRight className="size-6"/>Go to Configuration</Link>
          </Button>
        </div>
      </section>
    )
  }
  
  const soilsByProfile = Object.groupBy(soilsData, soil => soil.soilProfileId!)
  return (
    <section className="h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">

      <div className="mx-3">
        {profilesData.map((profile, index) => {
          const profileSoils = soilsByProfile[profile.id!] || []
          return (
            <div key={profile.id} className="border-2 border-yellow-500 mt-5">
              <ToggleButton>
                <SoilDiagram profile={profile} profileSoils={profileSoils} index={index}/>
                <SoilGraph profileSoils={profileSoils}/>
              </ToggleButton>
            </div>
          )
        })}
      </div>

    </section>
  )
}