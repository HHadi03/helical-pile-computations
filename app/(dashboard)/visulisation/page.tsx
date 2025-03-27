import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function VisulisationPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  return (
    <main>
      Visulisation Page
    </main>
  )
}