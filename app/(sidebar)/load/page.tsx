import { Metadata } from "next"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: "Load | Helical Pile Computations",
  description: "Load your data and configurations.",
}

export default async function LoadPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  return (
    <div>
      Load Page
    </div>
  )
}