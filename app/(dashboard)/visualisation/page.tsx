import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Visualisation | Helical Pile Computations",
  description: "View and compare your computed results as graphs.",
}

export default async function VisualisationPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/")
  }

  return (
    <div>
      <h1>Visualisation</h1>
    </div>
  )
}