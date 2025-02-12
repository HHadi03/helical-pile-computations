import { CalculateForm } from './CalculateForm'
import { getSoils } from '@/app/lib/api/getSoils'

export default async function CalculateSoilPage() {
    const existingSoils = await getSoils()
    if (!existingSoils || existingSoils.length === 0) {
        return (
            <div className="text-red-500 text-sm p-4 border border-gray-600 rounded-lg flex justify-center">
                No soil layers found. Please insert soil layers to calculate.
            </div>
        )
    }
       
    return (
        <div className='p-5 border border-gray-600 rounded-lg max-h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full
            scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600'>
            <CalculateForm soils={existingSoils}/>
        </div>
    )
}