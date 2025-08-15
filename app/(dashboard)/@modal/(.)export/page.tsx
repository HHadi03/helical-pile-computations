import { Modal } from "@/components/Modal"
import { createClient } from "@/utils/supabase/server"
import { InsertDesignMethodForm } from "../../configuration/design-method/InsertDesignMethodForm"

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
  
export default async function ExportModal() {
  return (
    <Modal title='Export'>
      <div className='px-4'>
        <InsertDesignMethodForm soilProfiles={await getSoilProfiles()} />
      </div>
    </Modal>
  )
}


