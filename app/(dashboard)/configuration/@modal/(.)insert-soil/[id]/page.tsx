import { InsertSoilForm } from '../../../insert-soil/[id]/InsertSoilForm'
import { Modal } from '@/components/Modal'
import { createClient } from '@/utils/supabase/server'

export default async function InsertSoilModal({params}:{params: Promise<{id: string}>}) {
  const supabase = await createClient()

  const { id } =  await params
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
    <Modal title='Add Soil Layer'>
      <InsertSoilForm previousEndDepth={previousEndDepth} profileId={id}/>
    </Modal>
  )
}