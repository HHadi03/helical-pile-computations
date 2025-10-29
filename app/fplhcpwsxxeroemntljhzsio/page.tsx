import { createClient } from "@/utils/supabase/server"
import { OutputComponent } from "./OutputComponent"
import { redirect } from "next/navigation"

export default async function ExportOutputPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/')
  }

  const { data: exportData, error: exportError } = await supabase
  .from("exports")
  .select("profile_data, soils_data, dynamic_params, base_params, pile_structure, image_url")
  .single()

  if (exportError || !exportData) {
    return <div className="p-6 text-red-600">An unexpected error has occured, please try again later.</div>
  }

  return (
    <OutputComponent 
      soilsData={exportData.soils_data} 
      profileData={exportData.profile_data} 
      dynamicParams={exportData.dynamic_params} 
      baseParams={exportData.base_params} 
      pileStructure={exportData.pile_structure} 
      imageUrl={exportData.image_url}
    />
  )
}


