import { EditSoilParameters } from '../../../edit-soil-parameters/[id]/EditSoilParametersForm'
import { Modal } from '@/components/Modal'
import { createClient } from '@/utils/supabase/server'

export default async function EditSoilParametersModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data, error } = await supabase
  .from('soils')
  .select("start_depth, end_depth, y_moist, y_sat, n_value, soil, soil_name, soil_type, soil_profile_id")
  .eq('id', id)
  .single()

  if (error) {
    return (
      <Modal title="Edit Soil Parameters">
        <div className="text-destructive text-sm flex justify-center">
          <p>Could not find soil data</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Edit Soil Parameters">
      <div className="px-4">
        <EditSoilParameters soil={data} soilId={id}/>
      </div>
    </Modal>
  )
}