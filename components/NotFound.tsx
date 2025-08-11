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
    <section className="flex flex-col items-center justify-center min-h-full">
      <h1 className="text-4xl font-bold">404 - Entry Not Found</h1>
      <p className="text-lg text-muted-foreground">The Entry you are looking for does not exist.</p>
      <Button variant="link" asChild>
        <Link href="/configuration" className='text-xl' prefetch={true}>Return to Configuration</Link>
      </Button>
    </section>
  )
}

