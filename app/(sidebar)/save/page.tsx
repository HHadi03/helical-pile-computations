import { Metadata } from "next"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: "Save | Helical Pile Computations",
  description: "Save your data and configurations.",
}

export default async function SavePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  return (
    <div>
      Save Page
    </div>
  )
}