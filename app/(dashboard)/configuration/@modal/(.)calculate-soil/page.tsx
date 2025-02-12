import { CalculateForm } from '@/app/(dashboard)/configuration/calculate-soil/CalculateForm'
import { Modal } from '@/app/components/Modal'
import { getSoils } from '@/app/lib/api/getSoils'

export default async function CalculateSoilModal() {
    const existingSoils = await getSoils()
    if (!existingSoils || existingSoils.length === 0) {
        return (
            <Modal title='Calculate Soil Parameters'>
                <div className="text-red-500 text-sm">
                    No soil layers found. Please insert soil layers to calculate.
                </div>
            </Modal>
        )
    }   
    
    return (
        <Modal title='Calculate Soil Parameters'>
            <div className='px-4'>
                <CalculateForm soils={existingSoils}/>
            </div>
        </Modal>
    )
}