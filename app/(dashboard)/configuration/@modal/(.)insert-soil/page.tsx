import { SoilForm } from '../../insert-soil/InsertSoilForm'
import { Modal } from '@/components/Modal'
import { getSoils } from '@/lib/getSoils'

export default async function InsertSoilModal() {
  const existingSoils = await getSoils()
  const previousEndDepth = existingSoils.length > 0 ? existingSoils[existingSoils.length - 1].endDepth : undefined

  return (
    <Modal title='Add Soil Layer'>
      <div className='px-4'>
        <SoilForm previousEndDepth={previousEndDepth}/>
      </div>
    </Modal>
  )
}