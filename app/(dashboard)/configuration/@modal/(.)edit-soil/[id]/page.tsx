import { EditForm } from '@/app/(dashboard)/configuration/edit-soil/[id]/EditForm'
import { Modal } from '@/components/Modal'
import { getSoil } from "@/lib/getSoil"

export default async function EditSoilModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params
  const soilsData = await getSoil(id)

  if (!soilsData) {
    return (
      <Modal title="Edit Soil Parameters">
        <div className="text-red-500 text-sm">
          <p>Could not find soil data</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Edit Soil Parameters">
      <div className="px-4">
        <EditForm soil={soilsData}/>
      </div>
    </Modal>
  )
}