import { SoilForm } from '../../../insert-soil/[id]/InsertSoilForm'
import { Modal } from '@/components/Modal'
import { getSoils } from '@/lib/getSoils'

export default async function InsertSoilModal({params}:{params: Promise<{id: string}>}) {
  const { id } =  await params

  const soilsData = await getSoils()
  const profileSoils = soilsData.filter((soil) => soil.soilProfileId === id)
  const previousEndDepth = profileSoils.length > 0 ? profileSoils[profileSoils.length - 1].endDepth : undefined

  return (
    <Modal title='Add Soil Layer'>
      <div className='px-4'>
        <SoilForm previousEndDepth={previousEndDepth} profileId={id}/>
      </div>
    </Modal>
  )
}