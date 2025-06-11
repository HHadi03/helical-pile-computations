import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getSoils } from "@/lib/getSoils"
import { getProfiles } from "@/lib/getProfiles"
import { SoilTable } from "./SoilTable"

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
  const ProfilesData = await getProfiles()

  return (
    <section className="h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">
      <SoilTable soilsData={soilsData} profilesData={ProfilesData}/>
    </section>
  )
}