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
    <section className='p-5 border rounded-lg min-h-full'>
      <ProfileForm/>
    </section>
  )
}