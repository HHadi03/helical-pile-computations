import { ModeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function SidebarLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex h-screen overflow-clip">
     
      <div className="flex flex-col flex-1">
        
        <div className="mt-5 mx-4 mb-2 border-b pb-4">
          <div className='flex justify-center relative'>
            <h1 className="text-2xl font-semibold">Helical Pile Computations</h1>
            <div className='absolute right-0'><ModeToggle/></div>
          </div>
        </div>
        
        <main className="h-full p-5 overflow-y-auto overflow-x-clip scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-500" style={{ scrollbarGutter: 'stable both-edges' }}>
          
          <div className="flex justify-end">
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