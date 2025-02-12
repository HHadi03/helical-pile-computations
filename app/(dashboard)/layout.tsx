import type { Metadata, Viewport } from "next"
import { Topbar } from '../components/Topbar'
import { Sidebar } from '../components/Sidebar'
import { Setting } from '../components/Setting'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "Dashboard",
  description: "This is the Dashboard Page",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <div className="flex shrink-0">
        <Sidebar/>
      </div>
  
      <div className="flex-1 flex flex-col min-h-0">

        <div className="bg-gradient-to-b from-slate-50 via-white to-blue-50 shadow-inner pt-5">
          <Setting/>
          <h1 className="flex justify-center text-2xl font-extrabold text-gray-800">Dashboard</h1>
          <Topbar/>
        </div>

        <div className="p-5 flex-1 min-h-0">{children}</div>

      </div>
    </div>
  )
}
