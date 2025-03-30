import { PileForm } from '@/app/(dashboard)/configuration/pile/PileForm'
import { Modal } from '@/components/Modal'
import { getPile } from '@/lib/getPile'

export default async function PileModal() {
  const pileData = await getPile()

  if (!pileData) {
    return (
      <Modal title='Configure Pile'>
        <div className='text-red-500 text-sm'>
          <p>Failed to load pile data.</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title='Configure Pile'>
      <div className='px-4'>
        <PileForm pile={pileData}/>
      </div>
    </Modal>
  )
}