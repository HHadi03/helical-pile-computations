import { SoilForm } from './InsertSoilForm'
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

  const {data: profileData, error: profileError} = await supabase
  .from("soil_profiles")
  .select("id")

  const validId = profileData!.some((profile) => profile.id === id)
  
  if (!validId || profileError){
    return <NotFound/>
  }

  const profileSoils = soilsData.filter((soil) => soil.soilProfileId === id)
  const previousEndDepth = profileSoils.length > 0 ? profileSoils[profileSoils.length - 1].endDepth : undefined

  return (
    <section className='p-5 border border-gray-600 rounded-lg max-h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full
    scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600'>
      <SoilForm previousEndDepth={previousEndDepth} profileId={id}/>
    </section>
  )
}