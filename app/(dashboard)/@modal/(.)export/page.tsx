import { Modal } from "@/components/Modal"
import { createClient } from "@/utils/supabase/server"
import { ExportForm } from "./ExportForm"

export default async function ExportModal() {
  const supabase = await createClient()
  const { data, error } = await supabase
  .from("soil_profiles")
  .select("profile_name, id")
  .order("created_at", { ascending: true })

  if (error) {
    return (
      <Modal title="Error - Export Analysis">
        <div className="text-destructive text-sm flex justify-center">
          <p>Could not find soil profile data</p>
        </div>
      </Modal>
    )
  }

  if (data.length === 0) {
    return (
      <Modal title="Export Analysis">
        <div className="text-sm flex justify-center">
          <p>No soil profiles found</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title='Export Analysis'>
      <ExportForm soilProfiles={data}/>
    </Modal>
  )
}
