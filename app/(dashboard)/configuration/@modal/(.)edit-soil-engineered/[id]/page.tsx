import { EditSoilEngineered } from '../../../edit-soil-engineered/[id]/EditSoilEngineeredForm'
import { Modal } from '@/components/Modal'
import { createClient } from '@/utils/supabase/server'

export default async function EditSoilEngineeredModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data, error } = await supabase
  .from('soils')
  .select("su, t, angle, qult, soil_type")
  .eq('id', id)
  .single()
    
  if (error) {
    return (
      <Modal title="Error - Edit Soil Engineered">
        <div className="text-destructive text-sm flex justify-center">
          <p>Could not find soil data</p>
        </div>
      </Modal>
    )
  }
  
  return (
    <Modal title="Edit Soil Engineered">
      <div className="px-4">
        <EditSoilEngineered soil={data} soilId={id}/>
      </div>
    </Modal>
  )
}