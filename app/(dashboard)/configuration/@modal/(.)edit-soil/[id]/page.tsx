import { EditForm } from "@/app/(dashboard)/configuration/edit-soil/[id]/EditForm"
import { getSoil } from "@/app/lib/api/getSoil"
import { Modal } from '@/app/components/Modal'
import { getPile } from "@/app/lib/api/getPile"

type Props = {
  params: {
    id: string
  }
}

export default async function EditSoilModal({ params }: Props) {
  const { id } = await params
  const soil = await getSoil(id)
  const pile = await getPile()

  if (!soil?.id || !pile) {
    return (
      <Modal title="Edit Soil Parameters">
        <h1 className="text-2xl">No Soil Found for that ID, or pile data missing.</h1>
      </Modal>
    )
  }

  return (
    <Modal title="Edit Soil Parameters">
      <div className="px-4">
        <EditForm soil={soil} pile={pile}/>
      </div>
    </Modal>
  )
}