import { Modal } from "@/components/Modal"

export default async function SaveModal() {
  return (
    <Modal title='Save'>
      <div className='px-4'>
        Save Modal Active (Intercepted)
      </div>
    </Modal>
  )
}