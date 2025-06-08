'use client'
import { useState,useEffect } from 'react'
import { logOut } from '@/app/actions'
import { ArrowLeftToLine, ArrowRightToLine, LogOut,Save, FolderOpen, Download, RotateCcw, MessageSquareText, CircleHelp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const Sidebar = () => {
  const [expanded, setExpanded] = useState(false)
  
  useEffect(() => {
    const updateExpanded = () => {
      if (window.innerWidth < 768) {
        setExpanded(false)
      }
    }

    updateExpanded()
    window.addEventListener('resize', updateExpanded)
    return () => window.removeEventListener('resize', updateExpanded)
  }, [])
  
  const navigationItems = [
    { icon: Save, text: "Save", href: "/save"},
    { icon: FolderOpen, text: "Load", href: "/load"},
    { icon: Download, text: "Export", href: "/export"},
    { icon: RotateCcw, text: "Restart", href: "/restart"},
    { icon: MessageSquareText, text: "Feedback", href: "/feedback"},
    { icon: CircleHelp, text: "Help", href: "/help"},
  ]

  return (
    <div className={`flex flex-col border-r border-gray-300 p-2 bg-linear-to-tr from-slate-50 via-white to-blue-50 shadow-inner transition-[width] duration-300 ${expanded ? 'w-[260px]' : 'w-[70px]'}`}>
      
      {expanded ? (
        <div className="hidden md:flex mt-2 flex-row items-center gap-2">
          <Image height={39} width={187} src='/logo.png' alt='Company Logo' className="transition-opacity duration-200 hover:opacity-85"/>
          <button onClick={() => setExpanded(false)} aria-label="Collapse Sidebar" aria-expanded={expanded} className="py-2 px-3 rounded-sm hover:bg-gray-200">
            <ArrowLeftToLine className="size-6"/>
          </button>
        </div>
      ) : (
        <div className="hidden md:block">
          <button onClick={() => setExpanded(true)} aria-label="Expand Sidebar" aria-expanded={expanded} className="py-2 px-3 rounded-sm hover:bg-gray-200">
            <ArrowRightToLine className="size-6"/>
          </button>
        </div>
      )}
      
      <div className='flex flex-col justify-between h-full'>
        <nav>
          <ul className={`space-y-4 ${expanded ? 'mt-10 md:mt-10' : 'mt-0 md:mt-10'}`}>
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              return (
                <li key={item.href} className={`relative group rounded-lg hover:bg-indigo-200 ${!expanded && 'justify-center'}`}>
                  <Link href={item.href} prefetch={false} className="text-gray-700 font-medium py-2 px-3 flex gap-3">
                    <IconComponent className='size-6 text-blue-800 shrink-0'/>
                    <span className={`transition-opacity duration-300 delay-100 ${ expanded ? 'opacity-100' : 'opacity-0 overflow-hidden'}`}> {item.text}</span>
                  </Link>

                  {!expanded && (
                    <div
                      className="absolute left-full top-1/2 -translate-y-1/2 px-2 py-1 bg-indigo-400 text-white text-sm rounded shadow-lg invisible opacity-0 translate-x-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:translate-x-5 z-20">
                      {item.text}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <ul>
          <li className={`relative group rounded-lg hover:bg-gray-200 ${!expanded && 'justify-center'}`}>
            <form action={logOut}>
              <button type="submit" className="text-gray-700 font-medium py-2 px-3 flex gap-3">
                <LogOut className="size-6 rotate-180 shrink-0"/>
                <span className={`transition-opacity duration-300 delay-100 whitespace-nowrap ${ expanded ? 'opacity-100 ': 'opacity-0'}`}>Log Out</span>
              </button>
            </form>

            {!expanded && (
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded shadow-lg invisible opacity-0 translate-x-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:translate-x-5 z-20 whitespace-nowrap">
                Log Out
              </div>
            )}
          </li>
        </ul>
      </div>

    </div>
  )
}