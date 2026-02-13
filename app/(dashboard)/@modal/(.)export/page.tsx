import { createClient } from '@/utils/supabase/server'
import { ExportForm } from "@/app/(sidebar)/export/ExportForm"
import { Modal } from '@/components/Modal'

export default async function ExportModal() {
  const supabase = await createClient()
  const { data: soilProfiles, error: soilProfilesError } = await supabase
  .from("soil_profiles")
  .select("profile_name, id, pile_stick_out, effective_pile_length, water_depth")
  .order("created_at", { ascending: true })

  if (soilProfilesError) {
    return (
      <Modal title="Generate Design Report">
        <div className="text-destructive text-sm flex justify-center">
          <p>Could not find soil profile data</p>
        </div>
      </Modal>
    )
  }

  if (soilProfiles.length === 0) {
    return (
      <Modal title="Generate Design Report">
        <div className="text-sm flex text-center items-center flex-col space-y-2">
          <p className="text-destructive">No Soil Profiles Found</p>
          <p className="text-muted-foreground">Please add a soil profile first before attempting to export analysis</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title='Generate Design Report'>
      <ExportForm soilProfiles={soilProfiles}/>
    </Modal>
  )
}