import { Metadata } from "next"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: "Feedback | Helical Pile Computations",
  description: "Send bug reports and share feedback with team.",
}

export default async function FeedbackPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/')
  }

  return (
    <section className='p-5 rounded-lg border max-w-lg mx-auto'>
      
    </section>
  )
}