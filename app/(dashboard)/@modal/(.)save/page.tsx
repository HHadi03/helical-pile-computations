export const dynamic = "force-dynamic"

import { Modal } from "@/components/Modal"
import { SaveForm } from "@/app/(sidebar)/save/SaveForm"

export default async function SaveModal() {
  return (
    <Modal title='Save Soil Profiles'>
      <SaveForm />
    </Modal>
  )
}