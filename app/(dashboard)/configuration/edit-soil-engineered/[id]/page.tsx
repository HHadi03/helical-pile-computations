import { EditSoilEngineered } from "./EditSoilEngineeredForm"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { NotFound } from '@/components/NotFound'

export default async function EditSoilEngineeredPage({params}:{params: Promise<{id: string}>}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const { id } =  await params
  const soilData = await getSoil(id)

  if (!soilData) {
    return <NotFound/>
  }

  return (
    <section className="p-5 rounded-lg border max-w-lg mx-auto">
      <EditSoilEngineered soil={soilData}/>
    </section>
  )
}
