import { EditSoilForm } from '../../../edit-soil-information/[id]/EditSoilForm'
import { Modal } from '@/components/Modal'
import { getSoil } from "@/lib/getSoil"

export default async function EditSoilInformationModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params
  const soilData = await getSoil(id)
  console.log(soilData)

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
        <EditSoilForm soil={soilData}/>
      </div>
    </Modal>
  )
}