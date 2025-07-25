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
  const { data: soilData, error: soilError } = await supabase
  .from('soils')
  .select("su, t, angle, qult, soil_type")
  .eq('id', id)
  .single()

  if (soilError) {
    return <NotFound/>
  }

  return (
    <section className="p-5 rounded-lg border max-w-lg mx-auto">
      <EditSoilEngineered soil={soilData} soilId={id}/>
    </section>
  )
}
