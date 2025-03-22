import { EditForm } from '../../../edit-soil/[id]/EditForm'
import { Modal } from '@/components/Modal'
import { getSoil } from "@/lib/getSoil"
import { getPile } from "@/lib/getPile"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function EditSoilModal(props: Props) {
  const params = await props.params
  const { id } = params
  const soil = await getSoil(id)
  const pile = await getPile()

  if (!soil?.id || !pile) {
    return (
      <Modal title="Edit Soil Parameters">
        <div className="text-red-500 text-sm">
          <p>Could not find soil data, or pile data is missing.</p>
        </div>
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