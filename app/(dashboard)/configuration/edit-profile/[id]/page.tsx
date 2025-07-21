import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { NotFound } from '@/components/NotFound'
import { EditProfileForm } from "./EditProfileForm"
import { snakeToCamel } from "@/lib/caseConversion"
import { TsoilProfileSchema } from "@/schemas/soilProfileSchema"

export default async function EditProfilePage({params}:{params: Promise<{id: string}>}) {
  const supabase = await createClient()
 
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const { id } =  await params
  const { data: profileData, error: profileError } = await supabase
    .from('soil_profiles')
    .select("id, profile_name, water_depth, pile_length, pile_stick_out")
    .eq('id', id)
    .single()
    
  if (profileError || !profileData) {
    return <NotFound/>
  }
  
  const camelProfileData = snakeToCamel(profileData) as TsoilProfileSchema

  return (
    <section className="p-5 rounded-lg border max-w-lg mx-auto">
      <EditProfileForm profile={camelProfileData}/>
    </section>
  )
}
