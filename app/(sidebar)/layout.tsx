import { Topbar } from "@/components/Topbar"

export default function SidebarLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex h-screen overflow-hidden">

      <div className="flex flex-col flex-1">
        <Topbar/>
        
        <main className="p-5 flex-1 overflow-y-auto overflow-x-clip scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-500" style={{ scrollbarGutter: 'stable both-edges' }}>
          {children}
        </main>
      </div>

    </div>
  )
}