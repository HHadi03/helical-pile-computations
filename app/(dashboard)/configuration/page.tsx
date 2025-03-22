import { getSoils } from "@/lib/getSoils"
import SoilTable from './SoilTable'  

export default async function ConfigurationPage() {
  return (
    <main className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400
    scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">
      <SoilTable soilsData={await getSoils()}/>
    </main>
  )
}