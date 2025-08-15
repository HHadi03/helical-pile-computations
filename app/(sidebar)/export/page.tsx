import { Metadata } from "next"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { InsertDesignMethodForm } from "@/app/(dashboard)/configuration/design-method/InsertDesignMethodForm"

export const metadata: Metadata = {
  title: "Export | Helical Pile Computations",
  description: "Export your data and configurations.",
}

type SoilProfile = {
  id: string
  profile_name: string
  effective_pile_length: number
}

async function getSoilProfiles(): Promise<SoilProfile[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("soil_profiles")
      .select("profile_name, id, effective_pile_length")
      .order("created_at", { ascending: true })

    if (error) {
      return []
    }
    return data
  } catch {
    return []
  }
}
  
export default async function ExportPage() {
  const soilProfiles = await getSoilProfiles()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  return (
    <section className='p-5 rounded-lg border max-w-lg mx-auto'>
      <InsertDesignMethodForm soilProfiles={soilProfiles} />
    </section>
  )
}