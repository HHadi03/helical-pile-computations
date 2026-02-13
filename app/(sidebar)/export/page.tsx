import { Metadata } from "next"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ExportForm } from "./ExportForm"

export const metadata: Metadata = {
  title: "Export | Helical Pile Computations",
  description: "Export your data and configurations.",
}

export default async function ExportPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/')
  }

  const { data: soilProfiles, error: soilProfilesError } = await supabase
  .from("soil_profiles")
  .select("profile_name, id, pile_stick_out, effective_pile_length, water_depth")
  .order("created_at", { ascending: true })

  if (soilProfilesError) {
    return (
      <div className="text-destructive text-sm flex justify-center">
        <p>Could not find soil profile data</p>
      </div>
    )
  }

  if (soilProfiles.length === 0) {
    return (
      <div className="text-sm flex text-center items-center flex-col space-y-2">
        <p className="text-destructive">No Soil Profiles Found</p>
        <p className="text-muted-foreground">Please add a soil profile first before attempting to export analysis</p>
      </div>
    )
  }

  return (
    <section className='p-5 rounded-lg border max-w-lg mx-auto'>
      <ExportForm soilProfiles={soilProfiles}/>
    </section>
  )
}