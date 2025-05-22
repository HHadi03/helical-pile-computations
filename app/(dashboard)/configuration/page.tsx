import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getSoils } from "@/lib/getSoils"
import { getProfiles } from "@/lib/getProfiles"
import SoilTable from "./SoilTable"

export default async function ConfigurationPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }
  
  const soilsData = await getSoils()
  const ProfileData = await getProfiles()

  return (
    <main className="h-full relative overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400
    scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">
      <SoilTable soilsData={soilsData} profileData={ProfileData}/>
    </main>
  )
}