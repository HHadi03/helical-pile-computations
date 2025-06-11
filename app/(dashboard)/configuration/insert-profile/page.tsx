import { ProfileForm } from "./InsertProfileForm"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function InsertProfilePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  return (
    <section className='p-5 border border-gray-600 rounded-lg max-h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600'>
      <ProfileForm/>
    </section>
  )
}