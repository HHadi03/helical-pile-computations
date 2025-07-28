import { InsertDesignMethodForm } from "./InsertDesignMethodForm"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function DesignMethodPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const { data: designMethodData, error: designMethodDataError } = await supabase
  .from('design_methods')
  .select("*")
  .single()
 
  if (!designMethodData) {
    return (
      <section className='p-5 rounded-lg border max-w-lg mx-auto'>
        <InsertDesignMethodForm/>
      </section>
    )
  }

  else if (designMethodDataError) {
    return <div>Error loading data</div>
  }

  return (
    <section className='p-5 rounded-lg border max-w-lg mx-auto'>
      *Edit Design Method Form*
    </section>
  )
}