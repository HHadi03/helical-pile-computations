import { SoilForm } from './InsertSoilForm'
import { getSoils } from '@/lib/getSoils'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function InsertSoilPage() {

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const existingSoils = await getSoils()
  const previousEndDepth = existingSoils.length > 0 ? existingSoils[existingSoils.length - 1].endDepth : undefined

  return (
    <main className='p-5 border border-gray-600 rounded-lg max-h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full
    scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600'>
      <SoilForm previousEndDepth={previousEndDepth}/>
    </main>
  )
}