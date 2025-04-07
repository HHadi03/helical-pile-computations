import { getSoils } from "@/lib/getSoils"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

const SoilTable = dynamic(() => import("./SoilTable"))

function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}


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
      <Suspense fallback={<Loading />}>
      <SoilTable soilsData={soilsData}/>
      </Suspense>
    </main>
  )
}