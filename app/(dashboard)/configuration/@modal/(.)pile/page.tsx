import { PileForm } from '@/app/(dashboard)/configuration/pile/PileForm'
import { Modal } from '@/app/components/Modal'
import { getPile } from '@/app/lib/api/getPile'

export default async function PileModal() {
    const existingPileData = await getPile()
  
    if (!existingPileData) {
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
          <PileForm pile={existingPileData}/>
        </div>
      </Modal>
    )
  }