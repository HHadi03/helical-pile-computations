import { EditSoilEngineered } from '../../../edit-soil-engineered/[id]/EditSoilEngineeredForm'
import { Modal } from '@/components/Modal'
import { getSoil } from "@/lib/getSoil"

export default async function EditSoilEngineeredModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params
  const soilData = await getSoil(id)

  if (!soilData) {
    return (
      <Modal title="Edit Soil Engineered">
        <div className="text-destructive text-sm flex justify-center">
          <p>Could not find soil data</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Edit Soil Engineered">
      <div className="px-4">
        <EditSoilEngineered soil={soilData}/>
      </div>
    </Modal>
  )
}