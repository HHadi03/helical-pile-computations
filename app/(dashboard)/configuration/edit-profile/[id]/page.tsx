import { getProfile } from "@/lib/getProfile"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { NotFound } from '@/components/NotFound'
import { EditProfileForm } from "./EditProfileForm"

export default async function EditProfilePage({params}:{params: Promise<{id: string}>}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/')
  }

  const { id } =  await params
  const profileData = await getProfile(id)

  if (!profileData) {
    return <NotFound/>
  }

  return (
    <section className="p-5 border rounded-lg min-h-full">
    <EditProfileForm profile={profileData}/>
    </section>
  )
}
