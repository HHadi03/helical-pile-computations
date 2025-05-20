'use client'
import { useState } from 'react'
import { logOut } from '@/app/actions'
import {ArrowLeftToLine, ArrowRightToLine, LogOut } from 'lucide-react'
import Link from 'next/link'

export const Sidebar = () => {
  const [expanded, setExpanded] = useState(false)
  
  const navigationItems = [
    { icon: "/save-icon.png", text: "Save", alt: "Save Icon", href: "/save"},
    { icon: "/load-icon.png", text: "Load", alt: "Load Icon", href: "/load"},
    { icon: "/export-icon.png", text: "Export", alt: "Export Icon", href: "/export"},
    { icon: "/restart-icon.png", text: "Restart", alt: "Restart Icon", href: "/restart"},
    { icon: "/feedback-icon.png", text: "Feedback", alt: "Feedback Icon", href: "/feedback"},
    { icon: "/help-icon.png", text: "Help", alt: "Help Icon", href: "/help"},
  ]

  const toggleSidebar = () => setExpanded(!expanded)

  const renderNavBar = (item: typeof navigationItems[number]) => (
    <li key={item.href} className={`relative group rounded-lg hover:bg-indigo-200 transition-all duration-200 ${!expanded && 'justify-center'}`}>
      <Link href={item.href} prefetch={false} className="text-gray-700 font-medium py-2 px-3 flex gap-3">
        <img src={item.icon} alt={item.alt} className='w-6 h-auto'/>
        {expanded && <span className='whitespace-nowrap'>{item.text}</span>}
      </Link>

      {!expanded && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 px-2 py-1 bg-indigo-400 text-white text-sm rounded shadow-lg
          invisible opacity-0 translate-x-0 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-5 z-20 whitespace-nowrap">
          {item.text}
        </div>
      )}
    </li>
  )

  return (
    <aside className={`flex flex-col border-r border-gray-300 p-2 bg-gradient-to-tr from-slate-50 via-white to-blue-50 shadow-inner
    ${expanded ? 'w-[260px]' : 'w-[70px]'} transition-all duration-300`}>
      
      <div className='pt-2 flex gap-2'>
        {expanded ? (
          <>
            <div> 
              <img src='/logo.png' alt='Company Logo' className="transition-opacity duration-200 hover:opacity-85 w-auto h-auto"/>
            </div>

            <button onClick={toggleSidebar} aria-label="Collapse Sidebar" aria-expanded={expanded} className="px-3 rounded hover:bg-gray-200 shrink-0">
               <ArrowLeftToLine className="w-6 h-6" />
            </button>
          </>
        ) : (
          <button onClick={toggleSidebar} aria-label="Expand Sidebar" aria-expanded={expanded} className="p-2 rounded hover:bg-gray-200 grow">
           <ArrowRightToLine className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav>
        <ul className='space-y-4 pt-10'>
          {navigationItems.map(renderNavBar)}
        </ul>
      </nav>

      <ul className='mt-auto'>
        <li className={`relative group rounded-lg hover:bg-gray-200 ${!expanded && 'justify-center'}`}>
          <form action={logOut}>
            <button type="submit" className="text-gray-700 font-medium py-2 px-3 flex gap-3">
              <LogOut className="w-6 h-6"/> {expanded && <span className='whitespace-nowrap'>Sign Out</span>}
            </button>
          </form>

          {!expanded && (
            <div
              className="absolute left-full top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded shadow-lg
              invisible opacity-0 translate-x-0 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-5 z-20 whitespace-nowrap">
              Sign Out
            </div>
          )}
        </li>
      </ul>

    </aside>
  )
}