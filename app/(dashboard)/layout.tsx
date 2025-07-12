import { Topbar } from "@/components/Topbar"
import { Sidebar } from "@/components/Sidebar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Helical Pile Computations",
  description: "Dashboard providing configuration, overview, and visualisation features",
}

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex h-screen overflow-clip">
      <Sidebar/>
     
      <div className="flex flex-col flex-1">
        <Topbar/>
        <main className="h-full p-5 mt-2 overflow-y-auto overflow-x-clip scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-500" style={{ scrollbarGutter: 'stable both-edges' }}>
          {children}
        </main>
      </div>

    </div>
  )
}
