import { InsertProfileForm } from "./InsertProfileForm"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function InsertProfilePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/')
  }

  return (
    <section className='p-5 rounded-lg border max-w-lg mx-auto'>
      <InsertProfileForm/>
    </section>
  )
}