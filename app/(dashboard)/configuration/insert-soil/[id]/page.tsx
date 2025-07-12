import { InsertSoilForm } from './InsertSoilForm'
import { getSoils } from '@/lib/getSoils'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { NotFound } from '@/components/NotFound'

export default async function InsertSoilPage({params}:{params: Promise<{id: string}>}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const { id } =  await params
  const soilsData = await getSoils()

  const {error: profileError} = await supabase
  .from("soil_profiles")
  .select("id")
  .eq("id", id)
  
  if (profileError){
    return <NotFound/>
  }

  const profileSoils = soilsData.filter((soil) => soil.soilProfileId === id)
  const previousEndDepth = profileSoils.length > 0 ? profileSoils[profileSoils.length - 1].endDepth : undefined

  return (
    <section className='p-5 min-h-full rounded-lg border'>
      <InsertSoilForm previousEndDepth={previousEndDepth} profileId={id}/>
    </section>
  )
}