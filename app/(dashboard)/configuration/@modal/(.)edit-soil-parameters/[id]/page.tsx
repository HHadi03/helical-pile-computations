import { EditSoilParameters } from '../../../edit-soil-parameters/[id]/EditSoilParametersForm'
import { Modal } from '@/components/Modal'
import { getSoil } from "@/lib/getSoil"

export default async function EditSoilParametersModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params
  const soilData = await getSoil(id)

  if (!soilData) {
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
        <EditSoilParameters soil={soilData}/>
      </div>
    </Modal>
  )
}