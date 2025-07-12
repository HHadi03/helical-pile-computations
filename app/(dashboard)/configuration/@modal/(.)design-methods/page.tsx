import { getFactors } from "@/lib/getFactors"
import { SafetyFactorsForm } from "../../design-methods/SafetyFactorsForm"
import { Modal } from '@/components/Modal'

export default async function DesignMethodsModal() {
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
    <Modal title="Determine Design Methods">
      <div className="px-4">
        <SafetyFactorsForm safetyFactors={factorsData}/>
      </div>
    </Modal>
  )
}
