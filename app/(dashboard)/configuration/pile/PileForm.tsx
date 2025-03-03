"use client"
import { useToast } from "@/app/components/hooks/use-toast"
import { ToastAction } from "@/app/components/ui/toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { pileSchema, TpileSchema } from "@/app/schemas/pileSchema"
import { updatePile } from "@/app/(dashboard)/actions/updatePile"
import { Button } from "@/app/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/app/components/NumberInput"
import { Checkbox } from "@/app/components/ui/checkbox"
import { UseFormContext } from "../FormContext"
import { Loader2 } from "lucide-react"

type PileFormProps = {
  pile: TpileSchema 
}

export function PileForm({ pile }: PileFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { setHasUnsavedChanges } = UseFormContext()
  
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
        setHasUnsavedChanges(true)
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
        <div className="border-t-2 py-3">
          <FormField
            control={form.control}
            name="showBearingCapacity"
            render={({ field }) => (
              <FormItem className="flex flex-row space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5"/>
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Ulimate Bearing Capacity Calculations</FormLabel>
                <FormDescription>Enable or disable soil bearing pressure paramaters.</FormDescription>
              </div>
            </FormItem>
            )}
          />
        </div>
          
        <div className="space-y-8 border-b-2 pb-3">
          <FormField
            control={form.control}
            name="pileDiameter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pile Diameter (mm)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pile diameter"/>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="60">60 mm</SelectItem>
                    <SelectItem value="100">100 mm</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="waterDepth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Water Depth (m)</FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="0"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 pt-2">
        <Button type="submit" className="w-24" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</>) : ("Save" )}
        </Button>
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>Close</Button>
        </div>
      </form>
    </Form>
  )
}