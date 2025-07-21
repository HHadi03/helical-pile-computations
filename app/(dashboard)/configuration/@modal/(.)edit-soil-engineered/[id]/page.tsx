import { EditSoilEngineered } from '../../../edit-soil-engineered/[id]/EditSoilEngineeredForm'
import { Modal } from '@/components/Modal'
import { createClient } from '@/utils/supabase/server'
import { snakeToCamel } from '@/lib/caseConversion'

export default async function EditSoilEngineeredModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data, error } = await supabase
  .from('soils')
  .select("id, su, t, angle, qult, h, po, start_depth, end_depth, soil_type, soil, soil_name, soil_profile_id")
  .eq('id', id)
  .single()
    
  if (error || !data) {
    return (
      <Modal title="Edit Soil Engineered">
        <div className="text-destructive text-sm flex justify-center">
          <p>Could not find soil data</p>
        </div>
      </Modal>
    )
  }
  
  const soilData = snakeToCamel(data)

  return (
    <Modal title="Edit Soil Engineered">
      <div className="px-4">
        <EditSoilEngineered soil={soilData}/>
      </div>
    </Modal>
  )
}