import { EditForm } from "./EditForm"
import { getSoil } from "@/lib/getSoil"
import { getPile } from "@/lib/getPile"
import NotFound from "./not-found"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function EditSoilPage(props: Props) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const params = await props.params
  const { id } =  params
  const soil = await getSoil(id)
  const pile = await getPile()
  if (!soil?.id || !pile) {
    return <NotFound/>
  }

  return (
    <div className="p-5 border border-gray-600 rounded-lg max-h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full
      scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">
      <h1 className="text-2xl py-3 flex justify-center">Edit Soil Layer<span className="text-blue-500 pl-2">{id}</span></h1>
      <EditForm pile={pile} soil={soil}/>
    </div>
  )
}
