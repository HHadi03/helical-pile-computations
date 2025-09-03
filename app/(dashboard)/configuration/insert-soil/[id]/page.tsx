import { InsertSoilForm } from './InsertSoilForm'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { NotFound } from '@/components/NotFound'

export default async function InsertSoilPage({params}:{params: Promise<{id: string}>}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/')
  }

  const { id } =  await params
  const {data: profileData, error: profileError} = await supabase
  .from("soil_profiles")
  .select("id")
  .eq("id", id)
  .single()
  
  if (profileData?.id !== id || profileError) {
    return <NotFound/>
  }

  const {data: profileSoils, error: profileSoilsError} = await supabase
  .from("soils")
  .select("end_depth")
  .order('end_depth', { ascending: true })
  .eq("soil_profile_id", id)

  let previousEndDepth: number | undefined
  if (profileSoilsError || profileSoils.length === 0){
    previousEndDepth = undefined
  }

  else {
    previousEndDepth = profileSoils[profileSoils.length - 1].end_depth
  }

  return (
    <section className='p-5 rounded-lg border max-w-lg mx-auto'>
      <InsertSoilForm previousEndDepth={previousEndDepth} profileId={id}/>
    </section>
  )
}