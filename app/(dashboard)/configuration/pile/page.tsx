import { PileForm } from './PileForm'
import { getPile } from '@/lib/getPile'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function PilePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const pileData = await getPile()
  if (!pileData) {
    return (
      <div className="flex justify-center">
        Failed to load pile data.
      </div>
    )
  }

  return (
    <div className='p-5 border border-gray-600 rounded-lg max-h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full
    scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600'>
      <PileForm pile={pileData}/>
    </div>
  )
}