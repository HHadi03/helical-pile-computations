import { SoilForm } from './InsertSoilForm'

export default function InsertSoilPage() {
  return (
    <main className='p-5 border border-gray-600 rounded-lg max-h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full
    scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600'>
      <SoilForm />
    </main>
  )
}