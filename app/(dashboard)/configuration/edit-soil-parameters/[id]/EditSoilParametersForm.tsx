"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { TsoilSchema, soilSchema } from "@/schemas/soilSchema"
import { updateSoil } from "@/app/(dashboard)/configuration/actions/updateSoil"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function EditSoilParameters({ soil }: { soil: TsoilSchema }) {
  const router = useRouter()

  const form = useForm<TsoilSchema>({
    resolver: zodResolver(soilSchema),
    defaultValues: { ...soil }
  })

  const { formState: { isDirty, isSubmitting } } = form

  async function onSubmit(values: TsoilSchema) {
    try {
      const result = await updateSoil(values)

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {form.setError(key as keyof TsoilSchema, {message: Array.isArray(value) ? value[0] : String(value)})})
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
          <div className="flex gap-4 items-start">
            <FormField
              control={form.control}
              name="startDepth"
              render={({ field }) => (
                <FormItem className="w-27 hover:cursor-not-allowed">
                  <FormLabel>Start Depth <span className="font-semibold -ml-1">(m)</span></FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0" disabled/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDepth"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>End Depth <span className="font-semibold -ml-1">(m)</span></FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0" className="text-sm"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="yMoist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moist Unit Weight <span className="font-semibold -ml-1">(kN/m³)</span></FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="0" className="text-sm"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ySat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saturated Unit Weight <span className="font-semibold -ml-1">(kN/m³)</span></FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="0" className="text-sm"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SPT N-Value</FormLabel>
                <FormControl>
                  <NumberInput field={field} placeholder="0" className="text-sm"/>
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