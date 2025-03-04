import { getFactors } from "@/app/lib/api/getFactors"
import { SafetyFactorsForm } from "./SafetyFactorsForm"

export default async function SafetyFactorsPage() {
  const factorsData = await getFactors()
  
  if (!factorsData) {
    return <div>Failed to load safety factors data.</div>
  }
  
  return (
    <div className='p-5 border border-gray-600 rounded-lg max-h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full
    scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600'>
      <SafetyFactorsForm safetyFactors={factorsData}/>
    </div>
  )
}