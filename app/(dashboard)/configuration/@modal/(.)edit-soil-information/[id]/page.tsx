import { EditSoilInformation } from '../../../edit-soil-information/[id]/EditSoilInformationForm'
import { Modal } from '@/components/Modal'
import { getSoil } from "@/lib/getSoil"

export default async function EditSoilInformationModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params
  const soilData = await getSoil(id)
 
  if (!soilData) {
    return (
      <Modal title="Edit Soil Information">
        <div className="text-destructive text-sm flex justify-center">
          <p>Could not find soil data</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Edit Soil Information">
      <div className="px-4">
        <EditSoilInformation soil={soilData}/>
      </div>
    </Modal>
  )
}