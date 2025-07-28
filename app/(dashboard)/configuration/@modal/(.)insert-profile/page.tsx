import { InsertProfileForm } from "../../insert-profile/InsertProfileForm"
import { Modal } from "@/components/Modal"

export default async function InsertProfileModal() {
  return (
  	<Modal title='Add Soil Profile'>
			<div className='px-4'>
				<InsertProfileForm/>
			</div>
		</Modal>
  )
}