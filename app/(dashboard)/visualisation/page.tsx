import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Visualisation | Helical Pile Computations",
  description: "View and compare your computed results as graphs",
}

export default async function VisualisationPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/")
  }

  return (
    <div>
      Disabled
    </div>
  )
}