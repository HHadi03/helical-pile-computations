import type { Metadata } from "next"
import { Topbar } from "@/components/Topbar"
import { Sidebar } from "@/components/Sidebar"

export const metadata: Metadata = {
  title: "Dashboard | Helical Pile Computations",
  description: "Dashboard providing configuration, overview, and visualisation features",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar/>
     
      <div className="flex flex-col flex-1 min-h-0">
        <header className="px-5 pt-5">
          <h1 className="flex justify-center text-2xl font-extrabold text-gray-800">Dashboard</h1>
          <Topbar/>
        </header>

        <main className="p-5 flex-1 min-h-0">
          {children}
        </main>
      </div>

    </div>
  )
}
