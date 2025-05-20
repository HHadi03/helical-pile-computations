import { PileForm } from '@/app/(dashboard)/configuration/pile/[id]/PileForm'
import { Modal } from '@/components/Modal'
import { getPile } from '@/lib/getPile'

export default async function PileModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params
  const pileData = await getPile(id)

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