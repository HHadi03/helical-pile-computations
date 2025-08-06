import { InsertDesignMethodForm } from "./InsertDesignMethodForm"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

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

export default async function DesignMethodPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const { data: designMethodData, error: designMethodDataError } = await supabase
    .from('design_methods')
    .select("*")
    .single()

  const soilProfiles = await getSoilProfiles()
 
  if (!designMethodData) {
    return (
      <section className='p-5 rounded-lg border max-w-lg mx-auto'>
        <InsertDesignMethodForm soilProfiles={soilProfiles} />
      </section>
    )
  }

  else if (designMethodDataError) {
    return <div>Error loading data</div>
  }

  return (
    <section className='p-5 rounded-lg border max-w-lg mx-auto'>
      *Edit Design Method Form*
    </section>
  )
}