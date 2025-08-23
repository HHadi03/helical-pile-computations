import { Topbar } from "@/components/Topbar"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function SidebarLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex h-screen overflow-clip">
     
      <div className="flex flex-col flex-1">
        <Topbar />
        
        <main className="h-full p-5 overflow-y-auto overflow-x-clip scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-500" style={{ scrollbarGutter: 'stable both-edges' }}>
          <div className="flex justify-center mb-2">
            <Button asChild variant="link"> 
              <Link href="/configuration"> ← Return to Configuration</Link>
            </Button>
          </div>

          {children}
        </main>
      </div>

    </div>
  )
}