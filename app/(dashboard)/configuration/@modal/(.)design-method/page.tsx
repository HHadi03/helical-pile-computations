import { Modal } from '@/components/Modal'
import { InsertDesignMethodForm } from "../../design-method/InsertDesignMethodForm"
import { createClient } from "@/utils/supabase/server"

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

export default async function DesignMethodModal() {

  const supabase = await createClient()
  const { data: designMethodData, error: designMethodDataError } = await supabase
  .from('design_methods')
  .select("*")
  .single()
  
  const soilProfiles = await getSoilProfiles()
  if (!designMethodData) {
    return (
      <Modal title="Determine Design Method">
        <InsertDesignMethodForm soilProfiles={soilProfiles}/>
      </Modal>
    )
  }

  else if (designMethodDataError) {
    return (
      <Modal title="Error - Determine Design Method">
        <div className="text-destructive text-sm flex justify-center">
          <p>Could not find design method data</p>
        </div>
      </Modal>
    )
  }
  
  return (
    <Modal title="Determine Design Method">
      <div className="px-4">
        *Edit Design Method Form*
      </div>
    </Modal>
  )
}
