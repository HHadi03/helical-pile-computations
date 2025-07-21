"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { updateSoilEngineered } from "../../actions/updateSoilEngineered"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { NumberInput } from "@/components/NumberInput"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { engineeredSoilSchema, TEngineeredSoilSchema } from "@/schemas/engineeredSoilSchema"

export function EditSoilEngineered({ soil }: { soil: TEngineeredSoilSchema }) {
  const router = useRouter()

  const form = useForm<TEngineeredSoilSchema>({
    resolver: zodResolver(engineeredSoilSchema),
    defaultValues: { ...soil }
  })

  const { formState: { isDirty, isSubmitting } } = form

  async function onSubmit(values: TEngineeredSoilSchema) {
    try {
      const result = await updateSoilEngineered(values)

      if (result.errors) {
        Object.entries(result.errors).forEach(([key, value]) => {form.setError(key as keyof TEngineeredSoilSchema, {message: Array.isArray(value) ? value[0] : String(value)})})
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
          {soil.soilType === "fine" ? (
            <FormField
              control={form.control}
              name="su"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Undrained Shear Soil Strength <span className="font-semibold -ml-1">(kPa)</span></FormLabel>
                  <FormControl>
                    <NumberInput field={field} placeholder="0" className="text-sm"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
              <FormField
                control={form.control}
                name="angle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Angle of Internal Friction <span className="font-semibold -ml-1">(°)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0" className="text-sm"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="t"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shear Soil Strength <span className="font-semibold -ml-1">(kPa)</span></FormLabel>
                    <FormControl>
                      <NumberInput field={field} placeholder="0" className="text-sm"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="qult"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bearing Pressure <span className="font-semibold -ml-1">(kPa)</span></FormLabel>
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