import Link from 'next/link'
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Button } from './ui/button'

export const NotFound = async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/")
  }

  return (
    <section className="flex flex-col items-center text-center h-full overflow-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-slate-400 scrollbar-track-slate-200 scrollbar-hover:scrollbar-thumb-slate-500 scrollbar-active:scrollbar-thumb-slate-600">
      <h1 className="text-4xl font-bold mt-5">404 - Entry Not Found</h1>
      <p className="text-lg text-muted-foreground">The Entry you are looking for does not exist.</p>
      <Button variant="link" asChild><Link href="/configuration" className='text-xl'>Return to Configuration</Link></Button>
    </section>
  )
}

