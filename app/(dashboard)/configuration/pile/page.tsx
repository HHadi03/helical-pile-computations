import { PileForm } from './PileForm'
import { getPile } from '@/app/lib/api/getPile'

export default async function PilePage() {
  const existingPileData = await getPile()
  
  if (!existingPileData) {
    return <div>Failed to load pile data.</div>
  }

  return (
    <div className='p-5 border border-gray-600 rounded-lg max-h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full
    scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600'>
      <PileForm pile={existingPileData}/>
    </div>
  )
}