import { getSoils } from "@/lib/getSoils"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import SoilTable from "./SoilTable"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"
import { AddProfileButton } from "@/components/AddProfileButton"
import { getProfile } from "@/lib/getProfile"
import Link from "next/link"

export default async function ConfigurationPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }
  
  const soilsData = await getSoils()
  const ProfileData = await getProfile()
  
  return (
    <main className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400
    scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">

      <Link href="/configuration/safety-factors" prefetch={false} scroll={false}>
        <Button variant="ghost" className="hover:bg-amber-100">
          <ShieldCheck className="h-5 w-5 text-amber-900"/> Define Parameters
        </Button>
      </Link>
    
      <SoilTable soilsData={soilsData} profileData={ProfileData}/>

      <div className="p-5">
        <AddProfileButton/>
      </div>
      
    </main>
  )
}