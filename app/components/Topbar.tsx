"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const Topbar = () => {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/overview', label: 'Overview' },
    { href: '/configuration', label: 'Configuration' },
    { href: '/visulisation', label: 'Visulisation' }
  ] 

 const isActiveLink = (href: string): boolean => pathname === href

  return (
    <nav className="py-2 border-b border-gray-300">
      <ul className="flex gap-7 justify-center">
        {navItems.map((item) => {
          const isActive = isActiveLink(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  text-gray-600  px-4 py-3 block font-semibold
                  hover:text-blue-600 relative hover:bg-blue-100 rounded-lg
                  after:content-[''] after:absolute after:bottom-[-0.5rem]
                  after:left-0 after:w-full after:h-0.5 after:bg-blue-600
                  after:transition-transform after:duration-200 after:ease-in-out
                  ${isActive ? 'text-blue-600 after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}`}>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

