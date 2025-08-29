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
        <div className="text-destructive text-sm flex justify-center border-t-2 pt-2">
          <p>Could not find soil data</p>
        </div>
      </Modal>
    )
  }
  
  return (
    <Modal title="Edit Soil Engineered">
      <EditSoilEngineered soil={data} soilId={id}/>
    </Modal>
  )
}