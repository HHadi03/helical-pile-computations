"use client"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { insertDesignMethodSchema, TinsertDesignMethodSchema } from "@/schemas/designMethodSchemas"
import { insertDesignMethod } from "../actions/insertDesignMethod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { Loader2 } from "lucide-react"

export function InsertDesignMethodForm() {
  const router = useRouter()
  
  const form = useForm<TinsertDesignMethodSchema>({
    resolver: zodResolver(insertDesignMethodSchema),
    defaultValues: {}
  })

  const { formState: { isDirty, isSubmitting } } = form
  const selectedMethod = form.watch("safety_design_method")

  async function onSubmit(values: TinsertDesignMethodSchema) {
    try {
      const result =  await insertDesignMethod(values)

      if (result.errors) {
        toast.error(result.message)
      }

      else {
        router.back()
        toast.success(result.message)
      }

    } catch {
      toast.error("An unexpected error has occurred.", { description: "Please try again later." })
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6 border-y-2 py-3">
          <FormField
            control={form.control}
            name="safety_design_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="safety_design_method">Safety Design Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                  <FormControl>
                    <SelectTrigger className="w-full" id="safety_design_method">
                      <SelectValue placeholder="Select design method"/>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="method_bs">Design by calculation (BS 8004)</SelectItem>
                    <SelectItem value="method_en">Design by calculation (EN 1997-1)</SelectItem>
                    <SelectItem value="method_test">Design by testing</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage/>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="permanent_actions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permanent Actions <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="0"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="variable_actions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variable Actions <span className="font-semibold -ml-1">(kN)</span></FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="0"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-2 flex justify-between">
          <Button type="submit" className="w-28" disabled={!isDirty || isSubmitting}>{isSubmitting ? (<><Loader2 className="mr-2 size-4 animate-spin" />Saving...</>) : ("Save")}</Button>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={router.back}>Close</Button>
        </div>
      </form>
    </Form>
  )
}