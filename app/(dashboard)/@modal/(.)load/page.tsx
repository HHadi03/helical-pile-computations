export const dynamic = "force-dynamic"

import { Modal } from "@/components/Modal"
import { LoadForm } from "@/app/(sidebar)/load/LoadForm"

export default async function LoadModal() {
  return (
    <Modal title='Load Soil Profiles'>
      <LoadForm />
    </Modal>
  )
}