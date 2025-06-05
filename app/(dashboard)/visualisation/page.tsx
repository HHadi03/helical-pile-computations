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
    <section className="h-full scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400
     scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">
      <h1 className="text-2xl font-bold mb-6">Incomplete</h1>
    </section>
  )
}