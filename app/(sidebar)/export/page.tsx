import { Metadata } from "next"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ExportForm } from "@/app/(dashboard)/@modal/(.)export/ExportForm"
import { NotFound } from "@/components/NotFound"

export const metadata: Metadata = {
  title: "Export | Helical Pile Computations",
  description: "Export your data and configurations.",
}

export default async function ExportPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const { data: soilProfiles, error: soilProfilesError } = await supabase
  .from("soil_profiles")
  .select("profile_name, id")
  .order("created_at", { ascending: true })

  if (soilProfilesError) {
    return <NotFound/>
  }

  return (
    <section className='p-5 rounded-lg border max-w-lg mx-auto'>
      <ExportForm soilProfiles={soilProfiles} />
    </section>
  )
}