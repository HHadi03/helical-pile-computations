import { Modal } from "@/components/Modal"
import { createClient } from "@/utils/supabase/server"
import { ExportForm } from "@/app/(sidebar)/export/ExportForm"

export default async function ExportModal() {
  const supabase = await createClient()
  const { data, error } = await supabase
  .from("soil_profiles")
  .select("profile_name, id")
  .order("created_at", { ascending: true })

  if (error) {
    return (
      <Modal title="Error - Export Analysis">
        <div className="text-destructive text-sm flex justify-center border-t-2 pt-2">
          <p>Could not find soil profile data</p>
        </div>
      </Modal>
    )
  }

  if (data.length === 0) {
    return (
     <Modal title="Export Analysis">
      <div className="text-sm flex text-center items-center flex-col space-y-2 border-y-2 py-2">
        <p className="text-destructive">No Soil Profiles Found</p>
        <p className="text-muted-foreground"> Please add a soil profile first before attempting to export analysis</p>
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
