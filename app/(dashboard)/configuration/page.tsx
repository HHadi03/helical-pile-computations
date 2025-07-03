import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getSoils } from "@/lib/getSoils"
import { getProfiles } from "@/lib/getProfiles"
import { SoilTable } from "./SoilTable"
import { Plus, FolderX } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Configuration | Helical Pile Computations",
  description: "Set up soil profiles and piles for analysis",
}

export default async function ConfigurationPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }
  
  const soilsData = await getSoils()
  const profilesData = await getProfiles()

  if (profilesData.length === 0) {
    return (
      <section className="bg-secondary border-2 border-foreground grid place-items-center h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">
       <div className="text-center py-5">
          <FolderX className="size-10 text-muted-foreground mb-2 mx-auto"/>
          <h3 className="text-2xl font-semibold mb-2">No Soil Profiles Found</h3>
          <p className="mb-4 text-muted-foreground">Start by adding a new soil profile to configure soil layers for analysis</p>
          <Button asChild className="w-80">
            <Link href="/configuration/insert-profile" prefetch={true} scroll={false}><Plus className="size-6"/>Add Soil Profile</Link>
          </Button>
        </div>
      </section>
    )
  }
 
  return (
    <section className="h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">
      <SoilTable soilsData={soilsData} profilesData={profilesData}/>
    </section>
  )
}