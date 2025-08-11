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
import { editSoilEngineeredSchema, TeditSoilEngineeredSchema } from "@/schemas/soilSchemas"

export function EditSoilEngineered({ soil, soilId }: { soil: TeditSoilEngineeredSchema, soilId: string }) {
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(editSoilEngineeredSchema),
    defaultValues: { ...soil }
  })

  const { formState: { isDirty, isSubmitting, dirtyFields } } = form

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.replace('/configuration') 
    }
  }

  async function onSubmit(values: TeditSoilEngineeredSchema) {
    try {
      const result = await updateSoilEngineered(values, soilId, dirtyFields)

      if (result.errors) {
        toast.error(result.message)
      } 
      
      else {
        handleClose()
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
          {soil.soil_type === "fine" ? (
            <FormField
              control={form.control}
              name="su"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Undrained Shear Strength <span className="font-semibold -ml-1">(kPa)</span></FormLabel>
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
                    <FormLabel>Shear Strength <span className="font-semibold -ml-1">(kPa)</span></FormLabel>
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
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleClose}>Close</Button>
        </div>
      </form>
    </Form>
  )
}