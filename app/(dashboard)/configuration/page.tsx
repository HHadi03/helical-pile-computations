import { getSoils } from "@/lib/getSoils"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

const SoilTable = dynamic(() => import("./SoilTable"))

function SkeletonLoader() {
  return (
    <div className="w-full space-y-6">
    {/* Navigation tabs */}
    <div className="flex gap-6 mb-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>

    {/* Title */}
    <div className="flex items-center">
      <Skeleton className="h-7 w-48" />
    </div>

    {/* Table header */}
    <div className="rounded-t-lg bg-slate-100 p-3">
      <div className="grid grid-cols-6 gap-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-32" />
      </div>
    </div>

    {/* Table rows */}
    {[1, 2, 3].map((row) => (
      <div key={row} className="border-b p-3">
        <div className="grid grid-cols-6 gap-4">
          <Skeleton className="h-5 w-6" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
    ))}

    {/* Action buttons */}
    <div className="flex justify-end gap-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
  )
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
      <Suspense fallback={<SkeletonLoader />}>
      <SoilTable soilsData={soilsData}/>
      </Suspense>
    </main>
  )
}