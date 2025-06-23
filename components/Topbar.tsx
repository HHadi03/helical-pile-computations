"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const Topbar = () => {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/configuration', label: 'Configuration' },
    { href: '/overview', label: 'Overview' },
    { href: '/visualisation', label: 'Visualisation' }
  ] 

  return (
    <nav className="py-2 border-b border-gray-300">
      <ul className="flex gap-7 justify-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                prefetch={false}
                href={item.href}
                className={`p-3 block font-semibold relative hover:text-blue-700 hover:bg-blue-100 rounded-lg after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-blue-700 after:transition-transform after:duration-200 after:ease-in-out ${isActive ? 'text-blue-700 after:scale-x-100' : 'text-foreground/70 after:scale-x-0 hover:after:scale-x-100'}`}>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

