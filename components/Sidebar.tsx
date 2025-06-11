'use client'
import { useState,useEffect } from 'react'
import { logOut } from '@/app/actions/logOut'
import { ArrowLeftToLine, ArrowRightToLine, LogOut,Save, FolderOpen, Download, RotateCcw, MessageSquareText, CircleHelp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
    <aside className={`flex flex-col shrink-0 border-r border-gray-300 p-2 bg-linear-to-tr from-slate-50 via-white to-blue-50 shadow-inner transition-[width] duration-300 overflow-y-auto overflow-x-clip scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600 ${expanded ? 'w-[260px]' : 'w-[70px]'}`}>
      
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
      
      <div className='flex flex-col justify-between h-full gap-5'>
        <nav>
          <ul className={`space-y-4 ${expanded ? 'mt-10 md:mt-10' : 'mt-0 md:mt-10'}`}>
            {navigationItems.map((item) => {
              return (
                <li key={item.href} className='rounded-lg hover:bg-indigo-200'>
                  {!expanded ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={item.href} className="text-gray-700 font-medium py-2 px-3 flex gap-3">
                          <item.icon className='size-6 text-blue-800 shrink-0'/>
                          <span className={`transition-opacity duration-300 delay-100 ${ expanded ? 'opacity-100' : 'opacity-0 overflow-hidden'}`}> {item.text}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className='px-2 py-1 bg-indigo-400 text-sm rounded' colorCode='bg-indigo-400 fill-indigo-400'>
                        <p>{item.text}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link href={item.href} className="text-gray-700 font-medium py-2 px-3 flex gap-3">
                      <item.icon className='size-6 text-blue-800 shrink-0'/>
                      <span className={`transition-opacity duration-300 delay-100 ${ expanded ? 'opacity-100' : 'opacity-0 overflow-hidden'}`}> {item.text}</span>
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
          
        {!expanded ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="submit" className="text-gray-700 font-medium py-2 px-3 flex gap-3 rounded-lg hover:bg-gray-200" onClick={async () => await logOut()}>
                <LogOut className="size-6 rotate-180 shrink-0"/>
                <span className={`transition-opacity duration-300 delay-100 whitespace-nowrap ${ expanded ? 'opacity-100 ': 'opacity-0'}`}>Log Out</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className='px-2 py-1 bg-gray-200 text-black text-sm rounded' colorCode='bg-gray-200 fill-gray-200'>
              <p>Log Out</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <button type="submit" className="text-gray-700 font-medium py-2 px-3 flex gap-3 rounded-lg hover:bg-gray-200" onClick={async () => await logOut()}>
            <LogOut className="size-6 rotate-180 shrink-0"/>
            <span className={`transition-opacity duration-300 delay-100 whitespace-nowrap ${ expanded ? 'opacity-100 ': 'opacity-0'}`}>Log Out</span>
          </button>
        )}
      </div>

    </aside>
  )
} 