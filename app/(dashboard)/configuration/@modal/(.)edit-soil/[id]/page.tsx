import { EditSoilForm } from '../../../edit-soil/[id]/EditSoilForm'
import { Modal } from '@/components/Modal'
import { getSoil } from "@/lib/getSoil"

export default async function EditSoilModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params
  const soilData = await getSoil(id)

  if (!soilData) {
    return (
      <Modal title="Edit Soil Layer">
        <div className="text-red-500 text-sm">
          <p>Could not find soil data</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Edit Soil Layer">
      <div className="px-4">
        <EditSoilForm soil={soilData}/>
      </div>
    </Modal>
  )
}