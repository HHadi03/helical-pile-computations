export const dynamic = 'force-dynamic'

import { InsertProfileForm } from "../../insert-profile/InsertProfileForm"
import { Modal } from "@/components/Modal"

export default async function InsertProfileModal() {
  return (
  	<Modal title='Add Soil Profile'>
			<InsertProfileForm/>
		</Modal>
  )
}