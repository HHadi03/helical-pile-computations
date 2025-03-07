import type { Metadata } from "next"
import { Topbar } from '../components/Topbar'
import { Sidebar } from '../components/Sidebar'

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard Page",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      
      {/*Sidebar*/}
      <div className="flex shrink-0">
        <Sidebar/>
      </div>

      {/*Main Content Area*/}
      <div className="flex-1 flex flex-col min-h-0">

        {/*Topbar*/}
        <div className="px-5 pt-5">
          <h1 className="flex justify-center text-2xl font-extrabold text-gray-800">Dashboard</h1>
          <Topbar/>
        </div>

        {/*Main Content*/}
        <div className="p-5 flex-1 min-h-0">
          {children}
        </div>
      </div>

    </div>
  )
}
