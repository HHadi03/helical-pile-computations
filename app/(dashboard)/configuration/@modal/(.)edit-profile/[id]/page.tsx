import { Modal } from '@/components/Modal'
import { EditProfileForm } from '../../../edit-profile/[id]/EditProfileForm'
import { createClient } from '@/utils/supabase/server'

export default async function EditProfileModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params

  const supabase = await createClient()
  const { data, error} = await supabase
  .from('soil_profiles')
  .select("profile_name, water_depth, pile_length, pile_stick_out")
  .eq('id', id)
  .single()
 
  if (error) {
    return (
      <Modal title="Error - Edit Soil Profile">
        <div className="text-destructive text-sm flex justify-center border-t-2 pt-2">
          <p>Could not find soil profile data</p>
        </div>
      </Modal>
    )
  }
  
  return (
    <Modal title="Edit Soil Profile">
      <EditProfileForm profile={data} profileId={id}/>
    </Modal>
  )
}