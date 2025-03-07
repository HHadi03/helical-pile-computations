import { getFactors } from "@/app/lib/api/getFactors"
import { SafetyFactorsForm } from "../../safety-factors/SafetyFactorsForm"
import { Modal } from '@/app/components/Modal'

export default async function SafetyFactorsModal() {
  const factorsData = await getFactors()

  if (!factorsData) {
    return (
      <Modal title="Define Parameters">
        <div className='text-red-500 text-sm'>
          <p>Failed to load safety paramaters data.</p>
        </div>
      </Modal>
    ) 
  }
  
  return (
    <Modal title="Define Parameters">
      <div className="px-4">
        <SafetyFactorsForm safetyFactors={factorsData}/>
      </div>
    </Modal>
  )
}
