import { Modal } from "@/components/Modal"

export default async function LoadModal() {
  return (
    <Modal title='Load'>
      <div className='px-4'>
        Load Modal Active (Intercepted)
      </div>
    </Modal>
  )
}