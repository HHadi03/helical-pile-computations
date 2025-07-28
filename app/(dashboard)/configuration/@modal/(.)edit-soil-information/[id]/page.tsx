import { EditSoilInformation } from '../../../edit-soil-information/[id]/EditSoilInformationForm'
import { Modal } from '@/components/Modal'
import { createClient } from '@/utils/supabase/server'

export default async function EditSoilInformationModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params
   
  const supabase = await createClient()
  const { data, error } = await supabase
  .from('soils')
  .select("soil_type, density, soil, soil_name, description, colour")
  .eq('id', id)
  .single()
    
  if (error) {
    return (
      <Modal title="Error - Edit Soil Information">
        <div className="text-destructive text-sm flex justify-center">
          <p>Could not find soil data</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Edit Soil Information">
      <div className="px-4">
        <EditSoilInformation soil={data} soilId={id}/>
      </div>
    </Modal>
  )
}