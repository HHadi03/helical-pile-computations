import { EditSoilInformation } from "./EditSoilInformationForm"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { NotFound } from '@/components/NotFound'

export default async function EditSoilInformationPage({params}:{params: Promise<{id: string}>}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const { id } =  await params
  const { data: soilData, error: soilError } = await supabase
  .from('soils')
  .select("soil_type, density, soil, soil_name, description, colour")
  .eq('id', id)
  .single()

  if (soilError) {
    return <NotFound/>
  }

  return (
    <section className="p-5 rounded-lg border max-w-lg mx-auto">
      <EditSoilInformation soil={soilData} soilId={id}/>
    </section>
  )
}
