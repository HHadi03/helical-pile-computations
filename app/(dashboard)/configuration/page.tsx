import { getSoils } from "@/lib/getSoils"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { SkeletonLoader } from "@/components/SkeletonLoader"

const SoilTable = dynamic(() => import("./SoilTable"))

export default async function ConfigurationPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }
  
  const soilsData = await getSoils()
  
  return (
    <main className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400
    scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">
      <Suspense fallback={<SkeletonLoader/>}>
        <SoilTable soilsData={soilsData}/>
      </Suspense>
    </main>
  )
}