import { Modal } from '@/components/Modal'
import { EditProfileForm } from '../../../edit-profile/[id]/EditProfileForm'
import { getProfile } from '@/lib/getProfile'

export default async function EditSProfileModal({params}:{params: Promise<{id: string}>}) {
  const { id } = await params
  const profilesData = await getProfile(id)

  if (!profilesData) {
    return (
      <Modal title="Edit Soil Profile">
        <div className="text-red-500 text-sm">
          <p>Could not find profile data</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Edit Soil Profile">
      <div className="px-4">
       <EditProfileForm profile={profilesData}/>
      </div>
    </Modal>
  )
}