import { EditForm } from "./EditForm"
import { getSoil } from "@/lib/getSoil"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { NotFound } from '@/components/NotFound'

export default async function EditSoilPage({params}:{params: Promise<{id: string}>}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const { id } =  await params
  const SoilsData = await getSoil(id)

  if (!SoilsData) {
    return <NotFound/>
  }

  return (
    <div className="p-5 border border-gray-600 rounded-lg max-h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full
      scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">
      <h1 className="text-2xl pb-3 flex justify-center">Edit Soil:<span className="text-blue-500 pl-2">{SoilsData.soilName || SoilsData.soil}</span></h1>
      <EditForm soil={SoilsData}/>
    </div>
  )
}
