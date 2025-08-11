'use client'
import { useState, useEffect, Fragment } from 'react'
import { logOut } from '@/app/actions/logOut'
import { ArrowLeftToLine, ArrowRightToLine, LogOut, Save, FolderOpen, Upload, MessageSquareText, CircleHelp, Menu, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'

export const Sidebar = () => {
  const [expanded, setExpanded] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
   
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setExpanded(false)
      }

      if (window.innerWidth >= 640) {
        setMobileMenuOpen(false)
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => {window.removeEventListener('resize', handleResize)}
  }, [])
  
   const handleNavClick = () => {
    setMobileMenuOpen(false)
  }

  const navigationSections = [
    {
      title: "File",
      items: [
        { icon: Save, text: "Save", href: "/save"},
        { icon: FolderOpen, text: "Load", href: "/load"},
        { icon: Upload, text: "Export", href: "/export"},
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
    <>
       {!mobileMenuOpen && (
        <div className="sm:hidden fixed top-5 left-4 z-40">
          <Button variant="outline" size="icon" className='size-8' onClick={() => setMobileMenuOpen(true)} title='Toggle Sidebar'>
            <Menu className="size-[1.2rem]"/>
          </Button>
        </div>
      )}

      {mobileMenuOpen && (
        <div 
          className="sm:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`bg-sidebar flex flex-col shrink-0 border-r border-sidebar-border p-2 shadow-inner overflow-y-auto overflow-x-clip scrollbar-thin scrollbar-thumb-rounded scrollbar-track-rounded scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-500 transform transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'fixed left-0 top-0 h-full w-[260px] z-50 translate-x-0' : 'fixed left-0 top-0 h-full w-[260px] z-50 -translate-x-full'} sm:static sm:translate-x-0 ${expanded ? 'sm:w-[260px]' : 'sm:w-[70px]'}`}>

        {expanded ? (
          <div className="hidden xl:flex flex-row items-center justify-between mt-2">
            <Image src='/logo.png' alt='Company Logo' width={195} height={40}/>
            <Button title='Collapse Sidebar' variant="ghost" size="icon" onClick={() => setExpanded(false)} aria-label="Collapse Sidebar" aria-expanded={expanded} className='hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7'><ArrowLeftToLine className="size-6 text-muted-foreground"/></Button>
          </div>
        ) : (
          <div className="hidden xl:block">
            <Button title='Expand Sidebar' variant="ghost" onClick={() => setExpanded(true)} aria-label="Expand Sidebar" aria-expanded={expanded} className='hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7'><ArrowRightToLine className="size-6 text-muted-foreground"/></Button>
          </div>
        )}
        
        <div className="sm:hidden flex flex-row items-center justify-between mt-2 mb-10">
          <Image src='/logo.png' alt='Company Logo' width={195} height={40}/>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className='hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7'>
            <X className="size-6 text-muted-foreground"/>
          </Button>
        </div>

        <nav className='flex-1'>
          <ul className={`mb-2 ${expanded ? 'mt-0 xl:mt-10' : 'mt-0 xl:mt-10'}`}>
            {expanded || mobileMenuOpen ? (
              navigationSections.map((section, sectionIndex) => (
                <Fragment key={section.title}>
                  {sectionIndex > 0 && <li className="my-8"></li>}
                  <li className="px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{section.title}</li>
                  {section.items.map((item) => (
                    <li key={item.href} className='my-3 animate-in fade-in slide-in-from-top-8 duration-700'>
                      <Button asChild variant="ghost" className='hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7'>
                        <Link prefetch={true} href={item.href} className="flex gap-3 w-full justify-start"  onClick={handleNavClick}><item.icon className='size-6'/>{item.text}</Link>
                      </Button>
                    </li>
                  ))}
                </Fragment>
              ))
            ) : (
              allNavigationItems.map((item) => (
                <li key={item.href} className='my-4 hidden sm:block'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="ghost" className='hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7'>
                        <Link prefetch={true} href={item.href}> <item.icon className='size-6'/></Link>
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
          {!expanded  && !mobileMenuOpen ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" type="submit" className='hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7' onClick={async () => await logOut()}>
                  <LogOut className="size-6 rotate-180"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className='p-2 text-sm'>Log Out</TooltipContent>
            </Tooltip>
          ) : (
            <div className='animate-in fade-in slide-in-from-left-8 duration-700'>
              <Button variant="ghost" type="submit" className='w-full justify-start hover:bg-sidebar-foreground/7 dark:hover:bg-sidebar-foreground/7' onClick={async () => await logOut()}>
                <LogOut className="size-6 rotate-180"/>Log Out
              </Button>
            </div>
          )}
        </div>
      
      </aside>
    </>
  )
}


