'use client'
import { useState, useEffect, Fragment } from 'react'
import { logOut } from '@/app/actions'
import { ArrowLeftToLine, ArrowRightToLine, LogOut, Save, FolderOpen, FileDown, MessageSquareText, CircleHelp, Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import type { Route } from 'next'
import logo from '@/public/logo.png'

export const Sidebar = () => {
  const [expanded, setExpanded] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
   
  useEffect(() => {
    let resizeTimer: number

    const handleResize = () => {
      
      window.clearTimeout(resizeTimer)
      if (window.innerWidth < 1280) {
        setExpanded(false)
      }

      resizeTimer = window.setTimeout(() => {
      }, 150) 
    }

    handleResize()
    window.addEventListener('resize', handleResize)
  
    return () => {
      window.removeEventListener('resize', handleResize)
      window.clearTimeout(resizeTimer)
    }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logOut()
  }

  const navigationSections = [
    {
      title: "File",
      items: [
        { icon: Save, text: "Save", href: "/save"},
        { icon: FolderOpen, text: "Load", href: "/load"},
        { icon: FileDown, text: "Export", href: "/export"},
      ]
    },
    {
      title: "Support",
      items: [
        { icon: MessageSquareText, text: "Feedback", href: "/feedback"},
        { icon: CircleHelp, text: "Help", href: "/help"},
      ]
    }
  ]

  const allNavigationItems = navigationSections.flatMap(section => section.items)
  return (
    <aside className={`hidden bg-sidebar sm:flex flex-col shrink-0 border-r border-sidebar-border p-2 shadow-inner overflow-y-auto overflow-x-clip scrollbar-thin scrollbar-thumb-rounded scrollbar-track-rounded scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-500 ${expanded ? 'w-70 animate-in ease-in-out duration-500' : 'w-17.5 animate-out ease-out duration-500'}`}>
      {expanded ? (
        <div className="flex flex-row items-center justify-between mt-2">
          <Image src={logo} alt='Company Logo' className='w-54'/>
          <Button title='Collapse Sidebar' variant="ghost" size="icon" onClick={() => setExpanded(false)} aria-label="Collapse Sidebar" aria-expanded={expanded} className='hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7'><ArrowLeftToLine className="size-6 text-muted-foreground"/></Button>
        </div>
      ) : (
        <div className="hidden xl:block">
          <Button title='Expand Sidebar' variant="ghost" onClick={() => setExpanded(true)} aria-label="Expand Sidebar" aria-expanded={expanded} className='hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7'><ArrowRightToLine className="size-6 text-muted-foreground"/></Button>
        </div>
      )}
      
      <nav className='flex-1'>
        <ul className={`mb-2 ${expanded ? 'mt-0 xl:mt-10' : 'mt-0 xl:mt-10'}`}>
          {expanded ? (
            navigationSections.map((section, sectionIndex) => (
              <Fragment key={section.title}>
                {sectionIndex > 0 && <li className="my-8"></li>}
                <li className="px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{section.title}</li>
                {section.items.map((item) => (
                  <li key={item.href} className='my-3 animate-in fade-in slide-in-from-top-8 duration-500'>
                    <Button asChild variant="ghost" className='hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7'>
                      <Link prefetch={true} scroll={false} href={item.href as Route} className="flex gap-3 w-full justify-start"><item.icon className='size-6'/>{item.text}</Link>
                    </Button>
                  </li>
                ))}
              </Fragment>
            ))
          ) : (
            allNavigationItems.map((item) => (
              <li key={item.href} className='my-4'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild variant="ghost" className='hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7'>
                      <Link prefetch={true} scroll={false} href={item.href as Route}> <item.icon className='size-6'/></Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className='p-2 text-sm'>{item.text}</TooltipContent>
                </Tooltip>
              </li>
            ))
          )}
        </ul>
      </nav>
        
      <div className='pt-1 border-t border-sidebar-border'>
        {!expanded ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" type="button" disabled={isLoggingOut} className='hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7' onClick={handleLogout}>
                {isLoggingOut ? <Loader2 className="size-6 animate-spin" /> : <LogOut className="size-6 rotate-180" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className='p-2 text-sm'>Log Out</TooltipContent>
          </Tooltip>
        ) : (
          <div className='animate-in fade-in slide-in-from-left-8 duration-500'>
            <Button variant="ghost" type="button" disabled={isLoggingOut} className='w-full justify-start hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7' onClick={handleLogout}>
              {isLoggingOut ? (<> <Loader2 className="size-6 animate-spin" /> <span>Logging out...</span></>) : (<> <LogOut className="size-6 rotate-180" /> <span>Log Out</span></>)}
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}


