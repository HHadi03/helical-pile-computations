import { EditSoilParameters } from "./EditSoilParametersForm"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { NotFound } from '@/components/NotFound'

export default async function EditSoilParametersPage({params}:{params: Promise<{id: string}>}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/')
  }

  const { id } =  await params
  const { data: soilData, error: soilError } = await supabase
  .from('soils')
  .select("start_depth, end_depth, y_moist, y_sat, n_value, soil, soil_name, soil_type, soil_profile_id")
  .eq('id', id)
  .single()

  if (soilError) {
    return <NotFound/>
  }

  return (
    <section className="p-5 rounded-lg border max-w-lg mx-auto">
      <EditSoilParameters soil={soilData} soilId={id}/>
    </section>
  )
}
