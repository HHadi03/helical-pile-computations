import Link from 'next/link'
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function NotFound() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/")
  }

  return (
    <section className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold">404 - Entry Not Found</h1>
      <p className="text-lg text-gray-600">The Entry you are looking for does not exist.</p>
      <Link href="/configuration">Return to Configuration</Link>
    </section>
  )
}

