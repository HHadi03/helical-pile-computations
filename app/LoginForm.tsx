'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { logIn } from '@/app/actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { loginSchema, TloginSchema } from '@/schemas/authSchemas'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

export function LoginForm() {
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false) 

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  })

  async function onSubmit(values: TloginSchema) {
    setGlobalError(null)
    setIsPending(true) 

    const result = await logIn(values)

    if (result.error) {
      setGlobalError(result.error)
      setIsPending(false) 
    } 
    
    else { 
      setIsPending(false)
    }
  }

  return (
    <div className="border border-white/20 px-8 py-6 rounded-lg shadow-lg w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          
          {globalError && (
            <Alert variant="destructive" className="mb-4 bg-red-500/20 border-red-500/50 text-white">
              <AlertCircle className="size-4 text-white" />
              <AlertDescription className="text-white">
                {globalError}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-5 mb-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Email" 
                      {...field} 
                      autoComplete='email'
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      {...field} 
                      autoComplete='current-password'
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
          </div>
          
          <Button disabled={isPending} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg">
            {isPending ? <Loader2 className="size-6 animate-spin"/> : "Login"}
          </Button>
          <Button variant="link" type='button' className="text-white/70 hover:text-white -ml-3 mt-2">
            Forgotten Password?
          </Button>
        </form>
      </Form>
    </div>
  )
}