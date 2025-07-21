import { Modal } from '@/components/Modal'
import { EditProfileForm } from '../../../edit-profile/[id]/EditProfileForm'
import { createClient } from '@/utils/supabase/server'
import { snakeToCamel } from '@/lib/caseConversion'
import { TsoilProfileSchema } from '@/schemas/soilProfileSchema'

export default async function EditProfileModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params

  const supabase = await createClient()
  const { data, error } = await supabase
  .from('soil_profiles')
  .select("id, profile_name, water_depth, pile_length, pile_stick_out")
  .eq('id', id)
  .single()
    
  if (error || !data) {
    return (
      <Modal title="Edit Soil Profile">
        <div className="text-destructive text-sm flex justify-center">
          <p>Could not find profile data</p>
        </div>
      </Modal>
    )
  }
  
  const profileData = snakeToCamel(data) as TsoilProfileSchema
  
  return (
    <Modal title="Edit Soil Profile">
      <div className="px-4">
       <EditProfileForm profile={profileData}/>
      </div>
    </Modal>
  )
}