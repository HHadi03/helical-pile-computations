"use client"
import { useToast } from "@/components/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { pileSchema, TpileSchema } from "@/schemas/pileSchema"
import { updatePile } from "@/app/(dashboard)/configuration/actions/updatePile"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { Loader2 } from "lucide-react"

export function PileForm({ pile }:{pile: TpileSchema}) {
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<TpileSchema>({
    resolver: zodResolver(pileSchema),
    defaultValues: {...pile}
  })

  const { formState: { isDirty, isSubmitting } } = form
 
  async function onSubmit(values: TpileSchema) {
    try {
      const result = await updatePile(values)
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {
          form.setError(key as keyof TpileSchema, { message: Array.isArray(value) ? value[0] : String(value) })
        })
      }
      
      toast({
        duration: 2500,
        variant: result.errors ? "destructive" : "default",
        title: result.errors ? "Pile Update Failed" : "Pile Update Successful",
        description: result.message,
        action: result.errors && <ToastAction altText="Try again">Try again</ToastAction>
      })
      
      if (!result.errors) {
        router.back()
      }
  
    } catch {
      toast({
        duration: 2500,
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "An unexpected error occurred. Please try again later.",
        action: <ToastAction altText="Try again">Try again</ToastAction>
      })
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        
          
        <div className="space-y-8 border-b-2 pb-3">
          
          <FormField
            control={form.control}
            name="pileLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pile Length (m)</FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="Enter pile length"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pileStickout"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pile Stickout (m)</FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="Enter stick out"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-2">
        <Button type="submit" className="w-24" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</>) : ("Save" )}
        </Button>
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={router.back}>Close</Button>
        </div>
      </form>
    </Form>
  )
}