import { Metadata } from "next"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: "Help | Helical Pile Computations",
  description: "FAQ and instructions for usage of website.",
}

export default async function HelpPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/')
  }

  return (
    <div>
      Help Page
    </div>
  )
}