import { Topbar } from "@/components/Topbar"
import { Sidebar } from "@/components/Sidebar"

export default function DashboardLayout({children, modal}: {children: React.ReactNode, modal: React.ReactNode}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar/>
     
      <div className="flex flex-col flex-1 min-h-0">
        <Topbar/>

        <main className="h-full p-5 overflow-y-auto overflow-x-clip scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-500" style={{ scrollbarGutter: 'stable both-edges' }}>
          {children}
        </main>
      </div>
      
      {modal}
    </div>
  )
}
