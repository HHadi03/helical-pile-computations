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
      setTimeout(() => {setIsPending(false)}, 150)
    }
  }

  return (
    <div className="bg-background dark:bg-secondary px-8 py-6 rounded-lg shadow-lg w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          
          {globalError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} className="text-sm"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} className="text-sm"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button disabled={isPending} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg">
            {isPending ? <Loader2 className="size-6 animate-spin"/> : "Login"}
          </Button>
          <Button variant="link" className="text-muted-foreground hover:text-foreground/90 -ml-3 mt-2">Forgotten Password?</Button>
        </form>
      </Form>
    </div>
  )
}