'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { loginSchema,TloginSchema } from '@/schemas/authSchemas'

//login server action
export async function logIn(values: TloginSchema) {
  const supabase = await createClient()
  
  const parsed = loginSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Invalid input. Please check your email and password." }
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  
  if (error) {
    return {error: error.message || 'Login failed. Please check your credentials and try again.'}
  }
  
  revalidatePath('/', 'layout')
  redirect('/configuration')
}

// Logout server action
export async function logOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    redirect('/')
  }
  revalidatePath('/', 'layout')
  redirect('/')
}
