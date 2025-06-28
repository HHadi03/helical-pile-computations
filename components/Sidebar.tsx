'use client'
import { useState, useEffect, Fragment } from 'react'
import { logOut } from '@/app/actions/logOut'
import { ArrowLeftToLine, ArrowRightToLine, LogOut, Save, FolderOpen, SquareArrowOutUpRight, RotateCcw, MessageSquareText, CircleHelp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'

export const Sidebar = () => {
  const [expanded, setExpanded] = useState(false)
   
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setExpanded(false)
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => {window.removeEventListener('resize', handleResize)}
  }, [])
  
  const navigationSections = [
    {
      title: "File",
      items: [
        { icon: Save, text: "Save", href: "/save"},
        { icon: FolderOpen, text: "Load", href: "/load"},
        { icon: SquareArrowOutUpRight, text: "Export", href: "/export"},
      ]
    },
    {
      title: "Tools",
      items: [
        { icon: RotateCcw, text: "Restart", href: "/restart"},
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
    <aside className={`shrink-0 bg-sidebar flex flex-col border-r border-sidebar-border p-2 shadow-inner overflow-y-auto overflow-x-clip scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600 ${expanded ? 'w-[260px] animate-in ease-in-out duration-500' : 'w-[70px] animate-out ease-out duration-500'}`}>
      
      {expanded ? (
        <div className="hidden xl:flex flex-row items-center justify-between mt-2">
          <Image height={39} width={187} src='/logo.png' alt='Company Logo'/>
          <Button variant="ghost" size="icon" onClick={() => setExpanded(false)} aria-label="Collapse Sidebar" aria-expanded={expanded} className='hover:bg-sidebar-foreground/5 dark:hover:bg-sidebar-foreground/5'><ArrowLeftToLine className="size-6 text-muted-foreground"/></Button>
        </div>
      ) : (
        <div className="hidden xl:block">
          <Button variant="ghost" onClick={() => setExpanded(true)} aria-label="Expand Sidebar" aria-expanded={expanded} className='hover:bg-sidebar-foreground/5 dark:hover:bg-sidebar-foreground/5'><ArrowRightToLine className="size-6 text-muted-foreground"/></Button>
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
                  <li key={item.href} className='my-3 animate-in fade-in slide-in-from-top-8 duration-700'>
                    <Button asChild variant="ghost" className='hover:bg-sidebar-foreground/5 dark:hover:bg-sidebar-foreground/5'>
                      <Link href={item.href} className="flex gap-3 w-full justify-start"><item.icon className='size-6'/>{item.text}</Link>
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
                    <Button asChild variant="ghost" className='hover:bg-sidebar-foreground/5 dark:hover:bg-sidebar-foreground/5'>
                      <Link href={item.href}> <item.icon className='size-6'/></Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className='p-2 text-sm'>{item.text}</TooltipContent>
                </Tooltip>
              </li>
            ))
          )}
        </ul>
      </nav>
        
      <div className='mt-auto pt-1 border-t border-sidebar-border'>
        {!expanded ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" type="submit" className='hover:bg-sidebar-foreground/5 dark:hover:bg-sidebar-foreground/5' onClick={async () => await logOut()}>
                <LogOut className="size-6 rotate-180 text-muted-foreground"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className='p-2 text-sm'>Log Out</TooltipContent>
          </Tooltip>
        ) : (
          <Button variant="ghost" type="submit" className='w-full justify-start animate-in fade-in slide-in-from-left-8 duration-700 hover:bg-sidebar-foreground/5 dark:hover:bg-sidebar-foreground/5' onClick={async () => await logOut()}>
            <LogOut className="size-6 rotate-180 text-muted-foreground"/>Log Out
          </Button>
        )}
      </div>
     
    </aside>
  )
}


