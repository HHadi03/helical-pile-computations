"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'
import { ModeToggle } from './ThemeToggle'

export const Topbar = () => {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/configuration', label: 'Configuration' },
    { href: '/overview', label: 'Overview' },
    { href: '/visualisation', label: 'Visualisation' }
  ] 

  return (
    <header className='flex flex-col shrink-0 mt-5 mx-4 mb-2 @container'>

      <div className='flex justify-center relative'>
        <h1 className="text-lg sm:text-xl tracking-wide whitespace-nowrap"> Helical Pile Computations </h1>
        
        <div className='absolute right-0'> <ModeToggle/> </div>
      </div>
      
      <nav className="border-b py-2">
        <ul className="flex gap-2 sm:gap-7 justify-center">
          {navItems.map((item) => {
            const isActive = pathname.includes(item.href)
            return (
              <li key={item.href} className='relative'>
                <Button asChild variant="ghost">
                  <Link prefetch={true} href={item.href} className={`text-xs sm:text-sm font-semibold after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-primary after:transition-transform after:duration-200 after:ease-in-out ${isActive ? 'after:scale-x-100' :'text-muted-foreground after:scale-x-0 hover:after:scale-x-100'}`}>{item.label}</Link>
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}

