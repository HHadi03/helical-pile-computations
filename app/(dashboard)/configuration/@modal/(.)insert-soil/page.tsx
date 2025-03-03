import { SoilForm } from '@/app/(dashboard)/configuration/insert-soil/InsertSoilForm'
import { Modal } from '@/app/components/Modal'

export default function InsertSoilModal() {
    return (
        <Modal title='Add Soil Layer'>
            <div className='px-4'>
                <SoilForm/>
            </div>
        </Modal>
    )
}