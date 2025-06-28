"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'

export const Topbar = () => {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/configuration', label: 'Configuration' },
    { href: '/overview', label: 'Overview' },
    { href: '/visualisation', label: 'Visualisation' }
  ] 

  return (
    <nav className="border-b py-2 mx-5">
      <ul className="flex gap-7 justify-center">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href)
          return (
            <li key={item.href} className='relative'>
              <Button asChild variant="ghost">
                <Link prefetch={false} href={item.href} className={`after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-primary after:transition-transform after:duration-200 after:ease-in-out ${isActive ? 'font-semibold after:scale-x-100' :'text-muted-foreground after:scale-x-0 hover:after:scale-x-100'}`}>{item.label}</Link>
              </Button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

