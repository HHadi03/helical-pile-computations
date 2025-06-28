import { Topbar } from "@/components/Topbar"
import { Sidebar } from "@/components/Sidebar"
import { ModeToggle } from "@/components/ThemeToggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar/>
     
      <div className="flex flex-col flex-1 min-h-0 relative">
        
        <header className="pt-5 min-h-0 overflow-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">
          <h1 className="flex justify-center text-2xl font-semibold">Helical Piles Dashboard</h1>
          <Topbar/>
          <div className="top-5 right-5 absolute"><ModeToggle/></div>
        </header>

        <main className="p-5 flex-1 min-h-0">
          {children}
        </main>

      </div>

    </div>
  )
}
